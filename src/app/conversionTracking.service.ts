import {MatomoTracker} from "ngx-matomo";
import {Injectable} from "@angular/core";
import {Donation} from "./donation.model";
import {Campaign} from "./campaign.model";
import {environment} from "../environments/environment";
import {agreesToAnalyticsAndTracking, CookiePreferences, CookiePreferenceService} from "./cookiePreference.service";

@Injectable({
  providedIn: 'root',
})
export class ConversionTrackingService {
  private analyticsAndTrackingCookiesAllowed: boolean = false;
  constructor(
    private matomoTracker: MatomoTracker,
    private cookiePreferenceService: CookiePreferenceService,
  ) {
    this.cookiePreferenceService.userOptInToSomeCookies().subscribe(
      (prefs: CookiePreferences) => this.analyticsAndTrackingCookiesAllowed = agreesToAnalyticsAndTracking(prefs)
    );
  }


  public convert(donation: Donation, campaign: Campaign) {
    this.trackAnonymousEventsWithMatomo(donation);
    this.trackConversionWithMatomo(donation, campaign);
  }

  /**
   * Send events, including the one we use to see non-zero tip A/B conversion, which DO NOT
   * require PII or cookie consent. No-op when no A/B test running.
   */
  private trackAnonymousEventsWithMatomo(donation: Donation) {
    const tippedGoalId = environment.matomoNonZeroTipGoalId;
    if (donation.tipAmount > 0 && tippedGoalId) {
      this.matomoTracker.trackEvent('donate', 'non_zero_tip_finalised', `Donation to campaign ${donation.projectId}`, donation.tipAmount);
    this.matomoTracker.trackGoal(tippedGoalId, donation.tipAmount);
    }
  }

  private trackConversionWithMatomo(donation: Donation, campaign: Campaign) {
    if (! this.analyticsAndTrackingCookiesAllowed) {
      return;
    }

    if (!donation?.donationId) {
      return;
    }

    this.matomoTracker.addEcommerceItem(
      `campaign-${campaign.id}`,
      `Donation to ${campaign.charity.name} for ${campaign.title}`,
      'Campaign charity donations',
      donation.donationAmount,
    );

    if (donation.tipAmount > 0) {
      this.matomoTracker.addEcommerceItem(
        'tip',
        'Big Give tip',
        'Platform tip donations',
        donation.tipAmount,
      );
    }

    if (donation.feeCoverAmount > 0) {
      this.matomoTracker.addEcommerceItem(
        'fee-cover',
        'Big Give platform fee cover',
        'Processing fees',
        donation.feeCoverAmount,
      );
    }

    // "Tracks an Ecommerce order, including any eCommerce item previously added to the order."
    this.matomoTracker.trackEcommerceOrder(
      donation.donationId,
      donation.donationAmount + donation.tipAmount + donation.feeCoverAmount,
      donation.donationAmount,
    );
  }
}
