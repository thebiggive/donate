import { APP_BASE_HREF, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  Event as RouterEvent,
  NavigationEnd,
  Router,
} from '@angular/router';

import { AnalyticsService } from './analytics.service';
import { DonationService } from './donation.service';
import { GetSiteControlService } from './getsitecontrol.service';
import { NavigationService } from './navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private analyticsService: AnalyticsService,
    @Inject(APP_BASE_HREF) private baseHref: string,
    private donationService: DonationService,
    private getSiteControlService: GetSiteControlService,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {
    // https://www.amadousall.com/angular-routing-how-to-display-a-loading-indicator-when-navigating-between-routes/
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          this.navigationService.saveNewUrl(event.urlAfterRedirects);
        }
      }
    });
  }

  @HostListener('doButtonClick', ['$event']) onDoButtonClick(event: CustomEvent) {
    const url = event.detail.url;

    if (url.startsWith(this.baseHref)) {
      event.detail.event.preventDefault();
      this.router.navigateByUrl(url.replace(this.baseHref, ''));
    } // Else fall back to normal link behaviour
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.init();
      this.getSiteControlService.init();
    }

    // This service needs to be injected app-wide and this line is here, because
    // we need to be sure the server-detected `COUNTY_CODE` InjectionToken is
    // always set up during the initial page load, regardless of whether the first
    // page the donor lands on makes wider use of DonationService or not.
    this.donationService.deriveDefaultCountry();
  }

  /**
   * Ensure browsers don't try to navigate to non-targets. Top level items with a sub-menu
   * work on hover using pure CSS only.
   */
  noNav(event: Event) {
    event.preventDefault();
  }
}
