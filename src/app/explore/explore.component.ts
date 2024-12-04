import {CurrencyPipe, DatePipe, isPlatformBrowser, ViewportScroller} from '@angular/common';
import {
  AfterViewChecked,
  Component,
  HostListener,
  Inject,
  Input,
  makeStateKey,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  StateKey,
  TransferState,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {BiggiveCampaignCardFilterGrid} from '@biggive/components-angular';
import {skip, Subscription} from 'rxjs';

import {currencyPipeDigitsInfo} from '../../environments/common';
import {CampaignService, SearchQuery} from '../campaign.service';
import {CampaignGroupsService} from '../campaign-groups.service';
import {CampaignSummary} from '../campaign-summary.model';
import {PageMetaService} from '../page-meta.service';
import {SearchService} from '../search.service';
import {HighlightCard} from "../highlight-cards/HighlightCard";
import {Campaign} from "../campaign.model";
import {Fund} from "../fund.model";
import {NavigationService} from "../navigation.service";
import {FundService} from "../fund.service";
import {TimeLeftPipe} from "../time-left.pipe";
import {environment} from "../../environments/environment";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";

const openPipeToken = 'TimeLeftToOpenPipe';
const endPipeToken = 'timeLeftToEndPipe';

/** @todo Reduce overlap duplication w/ MetaCampaignComponent - see https://www.typescriptlang.org/docs/handbook/mixins.html */
@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrl: 'explore.component.scss',
  providers: [
    CurrencyPipe,
    // TimeLeftPipes are stateful, so we need to use a separate pipe for each date.
    {provide: openPipeToken, useClass: TimeLeftPipe},
    {provide: endPipeToken, useClass: TimeLeftPipe},
    DatePipe,
  ],
})
export class ExploreComponent implements AfterViewChecked, OnDestroy, OnInit {
  @ViewChild(BiggiveCampaignCardFilterGrid) cardGrid: BiggiveCampaignCardFilterGrid;

  public campaign: Campaign | undefined;
  private campaignId: string | undefined;
  parentIsSharedFund: boolean | undefined;
  public title: string  = 'Big Give'; // Includes fund info if applicable.

  individualCampaigns: CampaignSummary[];
  currencyPipeDigitsInfo = currencyPipeDigitsInfo;
  loading = false; // Server render gets initial result set; set true when filters change.
  /** Whether any non-default search logic besides an order change has been applied. */
  searched = false;

  // Campaign ID may be passed instead
  @Input({ required: false }) private campaignSlug: string;
  // Passed only on the fund-filtered view of this page.
  @Input({ required: false }) private fundSlug: string;

  private blurredSinceLastMajorScroll = false;
  private offset = 0;
  private routeParamSubscription: Subscription;
  private searchServiceSubscription: Subscription;
  private readonly smallestSignificantScrollPx = 250;

  beneficiaryOptions: string[] = [];
  categoryOptions: string[] = [];
  locationOptions: string[] = [];
  protected highlightCards: HighlightCard[];

  private queryParamsSubscription: Subscription;
  public fund?: Fund;
  private readonly recentChildrenKey = `${environment.donateUriPrefix}/children/v2`; // Key is per-domain/env
  public filterError = false;
  private readonly recentChildrenMaxMinutes = 10; // Maximum time in mins we'll keep using saved child campaigns


  /**
   * Default sort when not in relevance mode because there's a search term.
   */
  readonly defaultSort = 'matchFundsRemaining';

  public tickerItems: { label: string, figure: string }[] = [];
  private tickerUpdateTimer: number;

  constructor(
    private campaignService: CampaignService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private fundService: FundService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    private pageMeta: PageMetaService,
    private scroller: ViewportScroller,
    public searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private state: TransferState,
    @Inject(openPipeToken) private timeLeftToOpenPipe: TimeLeftPipe,
    @Inject(endPipeToken) private timeLeftToEndPipe: TimeLeftPipe,
    @Inject(SESSION_STORAGE) private sessionStorage: StorageService,
  ) {}

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.tickerUpdateTimer) {
      clearTimeout(this.tickerUpdateTimer);
    }

    this.routeParamSubscription?.unsubscribe();
    this.searchServiceSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
    this.routeChangeListener?.unsubscribe();

  }


  /**
   * Select salesforce IDs of any campaigns that have a rectangular hero image. The campaign's bannerURI
   * must first be selected to ensure it's suitable for use as a background behind all elements of the hero image
   * component
   *
   * For now enabled for one campaign in non-prod for testing only. Campaign IDs are the same in full and prod.
   */
  protected readonly campaignIdsWithRectangleImage: string[] = environment.environmentId !== 'production' ?
    [
      'a056900002RXrXtAAL',
      'a056900002SEVVPAA5', // Christmas Challenge 2024
    ] :
    [
      'a056900002SEVVPAA5', // Christmas Challenge 2024
    ];

  ngOnInit() {
    this.campaign = this.route.snapshot.data.campaign;
    this.campaignId = this.campaign?.id;
    this.parentIsSharedFund = this.campaign?.usesSharedFunds;
    this.title = this.campaign?.title || 'Big Give';

    this.listenForRouteChanges();

    this.setSecondaryPropsAndRun(this.campaign);

    let fundKey: StateKey<Fund>;
    if (this.fundSlug && this.campaign) {
      fundKey = makeStateKey<Fund>(`fund-${this.fundSlug}`);
      this.fund = this.state.get<Fund | undefined>(fundKey, undefined);
      if (this.fund) {
        this.setFundSpecificProps(this.fund, this.campaign);
      }
    }

    if (!this.fund && this.fundSlug && this.campaign) {
      this.fundService.getOneBySlug(this.fundSlug).subscribe(fund => {
        this.state.set<Fund>(fundKey, fund);
        this.fund = fund;
        if (this.fund) {
          this.setFundSpecificProps(this.fund, this.campaign!);
        }
      });
    }
    if (this.campaign) {
      this.setTickerParams(this.campaign);
    }


    this.beneficiaryOptions = CampaignGroupsService.getBeneficiaryNames();
    this.categoryOptions = CampaignGroupsService.getCategoryNames();
    this.locationOptions = CampaignGroupsService.getCountries();
    this.queryParamsSubscription = this.scrollToSearchWhenParamsChange();

  }

  public tickerMainMessage: string;


  private setFundSpecificProps(fund: Fund, campaign: Campaign) {
    this.tickerMainMessage = this.currencyPipe.transform(fund.amountRaised, campaign.currencyCode, 'symbol', currencyPipeDigitsInfo) +
      ' raised' + (campaign.currencyCode === 'GBP' ? ' inc. Gift Aid' : '');

    const durationInDays = Math.floor((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / 86400000);
    const tickerItems = [];
    tickerItems.push({
      label: 'total match funds',
      figure: this.currencyPipe.transform(
        fund.totalForTicker,
        campaign.currencyCode,
        'symbol',
        currencyPipeDigitsInfo
      ) as string,
    });
    if (CampaignService.isOpenForDonations(campaign)) {
      tickerItems.push({
        label: 'remaining',
        figure: this.timeLeftToEndPipe.transform(campaign.endDate),
      });
    } else {
      tickerItems.push({
        label: 'days duration',
        figure: durationInDays.toString(),
      });
    }
    this.tickerItems = tickerItems;

    // Show fund name if applicable *and* there's no fund logo. If there's a logo
    // its content + alt text should do the equivalent job.
    this.title = (!fund.logoUri && fund.name)
      ? `${campaign.title}: ${fund.name}`
      : campaign.title;

    this.pageMeta.setCommon(
      this.title,
      campaign.summary || 'A match funded campaign with Big Give',
      campaign.bannerUri,
    );
  }


  private setSecondaryPropsAndRun(campaign: Campaign | undefined) {
    this.searchService.reset(this.getDefaultSort(), true); // Needs `campaign` to determine sort order.
    this.loadQueryParamsAndRun();

    if (campaign) {
      this.pageMeta.setCommon(
        this.title,
        campaign.summary || 'A match funded campaign with Big Give',
        campaign.bannerUri,
      );
    } else {
      this.pageMeta.setCommon(
        'Big Give',
        'Big Give – discover campaigns and donate',
        'https://images-production.thebiggive.org.uk/0011r00002IMRknAAH/CCampaign%20Banner/db3faeb1-d20d-4747-bb80-1ae9286336a3.jpg',
      );
    }
  }

  private scrollToSearchWhenParamsChange() {
    return this.route.queryParams.pipe(skip(1)).subscribe((_params) => {
      if (isPlatformBrowser(this.platformId)) {
        const positionMarker = document.getElementById('SCROLL_POSITION_WHEN_PARAMS_CHANGE');

        // Angular routing changes scroll position (possibly while trying to restore a previous known position). Using setTimeout to
        // then scroll to the new best position for this use case (the search form and top of results) after that work has happened,
        // whenever the search filters change substantively.
        setTimeout(() => positionMarker?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }
    });
  }

  private shouldAutoScroll: boolean;

  ngAfterViewChecked() {
    if (isPlatformBrowser(this.platformId) && this.shouldAutoScroll) {
      // Update scroll to previous position in this scenario, unless the donor scrolls in the first 1s themselves and we turn off `shouldAutoScroll`.
      this.updateScroll(this.navigationService.getLastScrollY());
    }
  }

  private updateScroll(scrollY: number | undefined) {
    if (isPlatformBrowser(this.platformId) && scrollY && !this.autoScrollTimer) {
      // We need to allow enough time for the card layout to be in place. Firefox & Chrome both seemed to consistently
      // use a too-low Y position when lots of cards were shown and we didn't have a delay, both with `scrollToAnchor()`
      // and manual calculation + `scrollToPosition()`.

      this.autoScrollTimer = window.setTimeout(() => {
        if (this.shouldAutoScroll) {
          this.scroller.scrollToPosition([0, scrollY]);
          this.autoScrollTimer = undefined;
        }
      }, 1000);
    }
  }

  @HostListener('doSearchAndFilterUpdate', ['$event'])
  onDoSearchAndFilterUpdate(event: CustomEvent) {
    this.searchService.doSearchAndFilterAndSort(event.detail, this.defaultSort);
  }


  @HostListener('doCardGeneralClick', ['$event'])
  onDoCardGeneralClick(event: CustomEvent) {
    this.router.navigateByUrl(event.detail.url);
  }

  isInFuture(campaign: CampaignSummary) {
    return CampaignService.isInFuture(campaign);
  }

  isInPast(campaign: CampaignSummary) {
    return CampaignService.isInPast(campaign);
  }

  getRelevantDateAsStr(campaign: CampaignSummary) {
    const date = CampaignService.getRelevantDate(campaign);
    return date ? this.datePipe.transform(date, 'dd/MM/yyyy, HH:mm') : null;
  };

  /**
   * If we've filled the viewport plus a reasonable buffer, trigger a search with an increased offset.
   */
  more() {
    const cardsPerRow = (window.innerWidth < 600 ? 1 : (window.innerWidth < 968 ? 2 : 3));
    const safeNumberOfRows = 2 + (500 + window.scrollY) / 450; // Allow 500px for top stuff; 450px per card row; 2 spare rows
    const safeNumberToLoad = cardsPerRow * safeNumberOfRows;
    if (this.individualCampaigns.length < safeNumberToLoad) {
      this.loadMoreForCurrentSearch();
    }
  }

  onScroll() {
    const scrollPositionY = this.scroller.getScrollPosition()[1];
    if (scrollPositionY < this.smallestSignificantScrollPx) {
      // If we're now near the top, reset any previous input blurring as it might be helpful to blur again.
      this.blurredSinceLastMajorScroll = false;

      // On return with internal app nav, automatic position seems to be [0,59]
      // or so as of Nov '22. So we want only larger scrolls to be picked up as
      // donor intervention and to turn off auto-scroll + trigger loading of
      // additional campaigns.
      return;
    }

    if (!this.blurredSinceLastMajorScroll) {
      this.cardGrid && this.cardGrid.unfocusInputs();
      this.blurredSinceLastMajorScroll = true;
    }

    this.shouldAutoScroll = false;

    if (this.moreMightExist()) {
      this.more();
    }
  }

  clear() {
    this.searchService.reset(this.defaultSort, false);
  }

  getPercentageRaised(childCampaign: CampaignSummary) {
    if (this.campaign?.usesSharedFunds) {
      // No progressbar on child cards when parent is e.g. a shared fund emergency appeal.
      return null;
    }

    return CampaignService.percentRaisedOfIndividualCampaign(childCampaign);
  }

  private moreMightExist(): boolean {
    return (this.individualCampaigns.length === (CampaignService.perPage + this.offset));
  }

  private loadMoreForCurrentSearch() {
    this.offset += CampaignService.perPage;
    this.loading = true;
    const query = this.campaignService.buildQuery(
      this.searchService.selected,
      this.offset,
      this.campaignId,
      this.campaignSlug,
      this.fundSlug,
    );

    if (this.campaignId) {
      this.doCampaignSearch(query as SearchQuery, false);
    }
  }

  /**
   * Also saves results for imminent future navigation to the same meta-campaign + filters.
   */
  private doCampaignSearch(query: SearchQuery, clearExisting: boolean) {
    this.campaignService.search(query as SearchQuery).subscribe(campaignSummaries => {
      // Success
      this.individualCampaigns = clearExisting ? campaignSummaries : [...this.individualCampaigns, ...campaignSummaries];
      this.loading = false;

      if (isPlatformBrowser(this.platformId)) {
        // Save children so we can go 'back' here in the browser and maintain scroll position.
        // Only an exact query match should reinstate the same child campaigns on load.
        const recentChildrenData = {
          query: this.normaliseQueryForRecentChildrenComparison(query),
          offset: this.offset,
          children: this.individualCampaigns,
          time: Date.now(), // ms
        };

        this.sessionStorage.set(this.recentChildrenKey, recentChildrenData);
      }
    }, () => {
      this.filterError = true; // Error, should only be thrown if the callout SF API returns an error
      this.loading = false;
    });
  }


  private normaliseQueryForRecentChildrenComparison(query: SearchQuery): string {
    delete query.offset;

    return JSON.stringify(query); // We don't want to get into object key / true equality comparisons, so just JSON it.
  }


  private run() {
    this.searched = this.searchService.nonDefaultsActive;

    this.offset = 0;
    const query = this.campaignService.buildQuery(this.searchService.selected, 0, this.campaignId, this.campaignSlug, this.fundSlug);
    this.individualCampaigns = [];
    this.loading = true;

    this.campaignService.search(query as SearchQuery).subscribe(campaignSummaries => {
      this.individualCampaigns = campaignSummaries; // Success
      this.loading = false;
    }, () => {
        this.loading = false;
      },
    );

    if (!isPlatformBrowser(this.platformId)) { // Server renders don't need the scroll restoration help
      // this.doCampaignSearch(query as SearchQuery, true); // Clear existing children, though there _should_ be none on server
      return;
    }

    const recentChildrenData = this.sessionStorage.get(this.recentChildrenKey);
    // Only an exact query match should reinstate the same child campaigns on load.
    if (
      recentChildrenData &&
      recentChildrenData.time > (Date.now() - (60000 * this.recentChildrenMaxMinutes)) &&
      recentChildrenData.query === this.normaliseQueryForRecentChildrenComparison(query as SearchQuery)
    ) {
      this.individualCampaigns = recentChildrenData.children;
      // We need to separately reinstate the offset, while excluding it from the normalised query params
      // we use for equality comparison, so that moreMightExist() and therefore scrolling to load more
      // campaigns still works after we reinstate the existing children.
      this.offset = recentChildrenData.offset;

      // Auto scrolling without a significant extra wait only works when
      // the child campaigns were quickly loaded from local state from
      // a recent page view.
      if (this.navigationService.getLastScrollY() >= this.smallestSignificantScrollPx) {
        this.shouldAutoScroll = true;
      }

      this.loading = false;

      return;
    }

    // Else need to load children newly in browser.
    // this.doCampaignSearch(query as SearchQuery, true); // Clear existing children

  }

  /**
   * Get any query params from the requested URL.
   */
  private loadQueryParamsAndRun() {
    this.routeParamSubscription = this.route.queryParams.subscribe(params => {
      this.searchService.loadQueryParams(params, this.defaultSort);
      this.run();
    });

    this.searchServiceSubscription = this.searchService.changed.subscribe((interactive: boolean) => {
      if (!interactive) {
        return;
      }

      this.setQueryParams(); // Trigger a route change which in turn causes a `run()`.
    });
  }

  /**
   * Update the browser's query params when a sort or filter is applied.
   */
  private setQueryParams() {
    const nextQueryParams = this.searchService.getQueryParams(this.defaultSort);
    if (JSON.stringify(this.route.snapshot.queryParams) === JSON.stringify(nextQueryParams)) {
      // Don't navigate at all if no change in query params. This saves us from inconsistencies
      // later such as scroll adjustment kicking in only when the router params actually changed,
      // and saves giving the browser needless work to do.
      return;
    }

    this.router.navigate(['explore'], { queryParams: nextQueryParams });
  }

  private routeChangeListener: Subscription;
  private autoScrollTimer: number | undefined; // State update setTimeout reference, for client side scroll to previous position.

  private listenForRouteChanges() {
    this.routeChangeListener = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const scrollPositionY = this.scroller.getScrollPosition()[1];
        this.navigationService.saveLastScrollY(scrollPositionY);

        if (isPlatformBrowser(this.platformId) && this.autoScrollTimer) {
          window.clearTimeout(this.autoScrollTimer);
          this.autoScrollTimer = undefined;
        }
      }

      if (event instanceof NavigationEnd && event.url === '/') {
        this.searchService.reset(this.getDefaultSort(), false);
        this.run();
      }
    });
  }

  /**
   * Default sort when not in relevance mode because there's a search term.
   */
  getDefaultSort(): 'amountRaised' | 'matchFundsRemaining' {
    // Most Raised for completed Master Campaigns; Match Funds Remaining for others.
    return (this.campaign && new Date(this.campaign.endDate) < new Date()) ? 'amountRaised' : 'matchFundsRemaining';
  }

  private setTickerParams(campaign: Campaign) {
    // Does not necessarily imply 0 raised. We occasionally open child campaigns before their parents, so it
    // is possible for the parent `campaign` here to raise more than 0 before it formally opens.
    const campaignInFuture = CampaignService.isInFuture(campaign);

    const campaignOpen = CampaignService.isOpenForDonations(campaign);
    const durationInDays = Math.floor((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / 86400000);

    if (!this.fund) {
      if (!campaignInFuture) {
        const showGiftAid = campaign.currencyCode === 'GBP' && campaign.amountRaised > 0;
        this.tickerMainMessage = this.currencyPipe.transform(campaign.amountRaised, campaign.currencyCode, 'symbol', currencyPipeDigitsInfo) +
          ' raised' + (showGiftAid ? ' inc. Gift Aid' : '');
      } else {
        this.tickerMainMessage = 'Opens in ' + this.timeLeftToOpenPipe.transform(campaign.startDate);
      }
    }

    const tickerItems = [];

    if (!this.fundSlug) {
      if (campaignOpen) {
        tickerItems.push(...[
          {
            label: 'remaining',
            figure: this.timeLeftToEndPipe.transform(campaign.endDate),
          },
          {
            label: 'match funds remaining',
            figure: this.currencyPipe.transform(campaign.matchFundsRemaining, campaign.currencyCode, 'symbol', currencyPipeDigitsInfo) as string,
          },
        ]);
      } else {
        tickerItems.push({
          label: 'days duration',
          figure: durationInDays.toString(),
        });
      }

      if (campaign.campaignCount && campaign.campaignCount > 1) {
        tickerItems.push(
          {
            label: 'participating charities',
            figure: campaign.campaignCount.toLocaleString(),
          }
        )
      }

      if (campaign.donationCount > 0) {
        tickerItems.push(
          {
            label: 'donations',
            figure: campaign.donationCount.toLocaleString(),
          }
        )
      }

      tickerItems.push({
        label: 'total match funds',
        figure: this.currencyPipe.transform(campaign.matchFundsTotal, campaign.currencyCode, 'symbol', currencyPipeDigitsInfo) as string,
      });
    }

    // Just update the public property once.
    if (!this.fundSlug) {
      this.tickerItems = tickerItems;
    }

    if (this.tickerUpdateTimer) {
      window.clearTimeout(this.tickerUpdateTimer);
    }

    // Load data just once, but refresh e.g. time left to launch summary once
    // per second.
    if (isPlatformBrowser(this.platformId) && !this.fundSlug) {
      this.tickerUpdateTimer = window.setTimeout(() => {
        this.setTickerParams(campaign)
      }, 1000);
    }
  }

}
