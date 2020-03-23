import { Component, OnInit } from '@angular/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { Campaign } from '../campaign.model';
import { CampaignSummary } from '../campaign-summary.model';
import { CampaignService, SearchQuery } from '../campaign.service';
import { Fund } from '../fund.model';
import { FundService } from '../fund.service';
import { PageMetaService } from '../page-meta.service';

@Component({
  selector: 'app-meta-campaign',
  templateUrl: './meta-campaign.component.html',
  styleUrls: ['./meta-campaign.component.scss'],
})
export class MetaCampaignComponent implements OnInit {
  public campaign?: Campaign;
  public children: CampaignSummary[];
  public filterError = false;
  public fund?: Fund;
  public hasTerm = false;
  public loading = false; // Server render gets initial result set; set true when filters change.
  public resetSubject: Subject<void> = new Subject<void>();
  public selectedSort: string;

  private campaignId: string;
  private campaignSlug: string;
  private fundSlug: string;
  private perPage = 6;
  private query: {[key: string]: any};

  constructor(
    private campaignService: CampaignService,
    private fundService: FundService,
    private pageMeta: PageMetaService,
    private route: ActivatedRoute,
    private state: TransferState,
  ) {
    route.params.pipe().subscribe(params => {
      this.campaignId = params.campaignId;
      this.campaignSlug = params.campaignSlug;
      this.fundSlug = params.fundSlug;
    });
  }

  ngOnInit() {
    let metacampaignKey: StateKey<string>;
    if (this.campaignSlug) {
      metacampaignKey = makeStateKey<Campaign>(`metacampaign-${this.campaignSlug}`);
    } else {
      metacampaignKey = makeStateKey<Campaign>(`metacampaign-${this.campaignId}`);
    }
    this.campaign = this.state.get<Campaign | undefined>(metacampaignKey, undefined);

    let fundKey: StateKey<string>;
    if (this.fundSlug) {
      fundKey = makeStateKey<Fund>(`fund-${this.fundSlug}`);
      this.fund = this.state.get(fundKey, undefined);
    }

    if (this.campaign) { // app handed over from SSR to client-side JS
      this.setDefaultFilters();
      this.setSecondaryProps(this.campaign);
    } else {
      if (this.campaignId) {
        this.campaignService.getOneById(this.campaignId).subscribe(campaign => this.setCampaign(campaign, metacampaignKey));
      } else {
        this.campaignService.getOneBySlug(this.campaignSlug).subscribe(campaign => this.setCampaign(campaign, metacampaignKey));
      }
    }

    if (!this.fund && this.fundSlug) {
      this.fundService.getOneBySlug(this.fundSlug).subscribe(fund => {
        this.state.set(fundKey, fund);
        this.fund = fund;
      });
    }
  }

  onScroll() {
    if (this.moreMightExist()) {
      this.more();
    }
  }

  /**
   * If we've filled the viewport plus a reasonable buffer, trigger a search with an increased offset.
   */
  more() {
    const cardsPerRow = (window.innerWidth < 600 ? 1 : (window.innerWidth < 960 ? 2 : 3));
    const safeNumberOfRows = 2 + (500 + window.scrollY) / 450; // Allow 500px for top stuff; 450px per card row; 2 spare rows
    const safeNumberToLoad = cardsPerRow * safeNumberOfRows;
    if (this.children.length < safeNumberToLoad) {
      this.loadMoreForCurrentSearch();
    }
  }

  setDefaultFilters() {
    this.hasTerm = false;
    this.selectedSort = this.getDefaultSort();

    this.query = {
      parentCampaignId: this.campaignId,
      parentCampaignSlug: this.campaignSlug,
      fundSlug: this.fundSlug,
      limit: this.perPage,
      offset: 0,
    };

    this.handleSortParams();
    this.run();

    this.resetSubject.next();
  }

  handleSortParams() {
    this.query.sortField = this.selectedSort;
    if (this.selectedSort === '') { // this means sort by relevance for now
      this.query.sortDirection = undefined;
    } else { // match funds left and amount raised both make most sense in 'desc' order
      this.query.sortDirection = 'desc';
    }
  }

  onFilterApplied(update: { [filterName: string]: string, value: string}) {
    this.query[update.filterName] = update.value as string;

    this.run();
  }

  onSortApplied(selectedSort: string) {
    this.selectedSort = selectedSort;
    this.handleSortParams();
    this.run();
  }

  onMetacampaignSearch(term: string) {
    // Enable Relevance sort option and apply it if term is non-blank,
    // otherwise remove it and set to match funds remaining.
    this.hasTerm = (term !== '');
    this.selectedSort = (term === '' ? this.getDefaultSort() : '');

    this.query.term = term;
    this.handleSortParams();
    this.run();
  }

  private getDefaultSort(): string {
    // Most Raised for completed Master Campaigns; Match Funds Remaining for others.
    return (this.campaign && new Date(this.campaign.endDate) < new Date()) ? 'amountRaised' : 'matchFundsRemaining';
  }

  private loadMoreForCurrentSearch() {
    this.query.offset += this.perPage;
    this.loading = true;
    this.campaignService.search(this.query as SearchQuery).subscribe(campaignSummaries => {
      // Success
      this.children = [...this.children, ...campaignSummaries];
      this.loading = false;
    }, () => {
      this.filterError = true; // Error, e.g. slug not known
      this.loading = false;
    });
  }

  private moreMightExist(): boolean {
    return (this.children.length === (this.query.limit + this.query.offset));
  }

  private run() {
    this.query.offset = 0;
    this.children = [];
    this.loading = true;
    this.campaignService.search(this.query as SearchQuery).subscribe(campaignSummaries => {
      this.children = campaignSummaries; // Success
      this.loading = false;
    }, () => {
        this.filterError = true; // Error, e.g. slug not known
        this.loading = false;
      },
    );
  }

  /**
   * Set the campaign for the service and page metadata.
   */
  private setCampaign(campaign: Campaign, metacampaignKey: StateKey<Campaign>) {
    this.state.set(metacampaignKey, campaign); // Have data ready for client when handing over from SSR
    this.campaign = campaign;
    this.setDefaultFilters();
    this.setSecondaryProps(campaign);
  }

  private setSecondaryProps(campaign: Campaign) {
    this.pageMeta.setCommon(
      campaign.title,
      campaign.summary,
      campaign.bannerUri,
    );
  }
}
