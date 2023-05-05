import { Injectable } from '@angular/core';
import {
  CanMakePaymentResult,
  loadStripe,
  PaymentIntentResult,
  PaymentMethod,
  PaymentRequestPaymentMethodEvent,
  PaymentMethodCreateParams,
  PaymentRequest,
  PaymentRequestItem,
  Stripe,
  StripeCardElement,
  StripeElements,
  StripeError,
  StripePaymentRequestButtonElement,
} from '@stripe/stripe-js';
import { Observer } from 'rxjs';

import { AnalyticsService } from './analytics.service';
import { environment } from '../environments/environment';
import { Donation } from './donation.model';
import { DonationService } from './donation.service';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private didInit = false;
  private elements: StripeElements;
  private lastCardBrand?: string;
  private lastCardCountry?: string;
  private paymentRequest: PaymentRequest;
  private stripe: Stripe | null;
  private paymentMethodEvents: Map<string, PaymentRequestPaymentMethodEvent>;
  private paymentMethodIds: Map<string, string>; // Donation ID to payment method ID.
  private paymentError: boolean = false;
  constructor(
    private analyticsService: AnalyticsService,
    private donationService: DonationService,
  ) {}

  async init() {
    if (this.didInit) {
      return;
    }

    this.didInit = true;

    this.paymentMethodEvents = new Map();
    this.paymentMethodIds = new Map();

    // Initialising through the ES Module like this is not required, but is made available by
    // an official Stripe-maintained package and gives us TypeScript types for
    // the library's objects, which allows for better IDE hinting and more
    // checks that we are handling Stripe objects as intended.
    // See https://github.com/stripe/stripe-js
    this.stripe = await loadStripe(environment.psps.stripe.publishableKey);
    if (this.stripe) {
      this.elements = this.stripe.elements({fonts: [
        {
          family: 'Euclid Triangle',
          src: `url('${environment.donateGlobalUriPrefix}/d/EuclidTriangle-Regular.1d45abfd25720872.woff2') format('woff2')`,
          weight: '400',
        },
      ]});
    }
  }

  async createPaymentMethod(
    cardElement: StripeCardElement,
    donorName?: string,
  ): Promise<{paymentMethod?: PaymentMethod; error?: StripeError}> {
    if (!this.stripe) {
      console.log('Stripe not ready');
      return {};
    }

    // See https://stripe.com/docs/js/payment_methods
    const result = await this.stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: donorName,
      },
    });
    return result;
  }

  setLastCardMetadata(cardBrand?: string, cardCountry?: string) {
    this.lastCardBrand = cardBrand;
    this.lastCardCountry = cardCountry;
  }

  async confirmPaymentWithNewCardOrPRB(
    donationPreUpdate: Donation,
    cardElement: StripeCardElement,
  ): Promise<PaymentIntentResult | undefined> {
    if (!this.stripe || !donationPreUpdate.clientSecret || !donationPreUpdate.donationId) {
      console.log('Stripe not ready for confirmPayment()');
      return;
    }

    let paymentMethod: any;
    let isPrb = false;

    const billingDetails: PaymentMethodCreateParams.BillingDetails = {
      email: donationPreUpdate.emailAddress,
      name: `${donationPreUpdate.firstName} ${donationPreUpdate.lastName}` ?? undefined,
    };

    billingDetails.address = {
      country: donationPreUpdate.countryCode,
      postal_code: donationPreUpdate.billingPostalAddress, // Just postcode in the Stripe case.
    };

    // Ensure fee info is updated before finalising payment.
    return new Promise<PaymentIntentResult>((resolve, reject) => {
      this.donationService.updatePaymentDetails(donationPreUpdate, this.lastCardBrand, this.lastCardCountry)
      .subscribe(donation => {
        if (!donation.clientSecret || !donation.donationId) {
          reject('Missing ID in card-details-updated donation');
          return;
        }

        // Processing adapted from
        // https://stripe.com/docs/stripe-js/elements/payment-request-button?html-or-react=html#html-js-complete-payment
        // and card version merged with PRB one. More detailed comments on params
        // rationale there.
        if (this.paymentMethodIds.has(donation.donationId)) {
          isPrb = true;
          paymentMethod = this.paymentMethodIds.get(donation.donationId);
        } else {
          paymentMethod = {
            card: cardElement,
            // See https://stripe.com/docs/payments/accept-a-payment#web-submit-payment
            billing_details: billingDetails,
          };
        }

        let thePaymentMethodEvent = this.paymentMethodEvents.get(donation.donationId);

        this.payWithMethod(donation, paymentMethod, !isPrb).then(result => {
          if (thePaymentMethodEvent) {
            thePaymentMethodEvent.complete(result.error ? 'fail' : 'success');
          }

          resolve(result);
        }).catch(error => {
          if (thePaymentMethodEvent) {
            thePaymentMethodEvent.complete('fail');
          }

          reject(error);
        });
      });
    });
  }

  async confirmPaymentWithSavedMethod(
    donationPreUpdate: Donation,
    paymentMethod: PaymentMethod
  ): Promise<PaymentIntentResult | undefined> {
    return new Promise<PaymentIntentResult>((resolve, reject) => {
      this.setLastCardMetadata(paymentMethod.card?.brand, paymentMethod.card?.country as string);

      this.donationService.updatePaymentDetails(donationPreUpdate, this.lastCardBrand, this.lastCardCountry)
        .subscribe(donation => {
          if (!donation.clientSecret || !donation.donationId) {
            reject('Missing ID in card-details-updated donation');
            return;
          }

          this.payWithMethod(
            donation,
            paymentMethod.id, // Sending the full object for completion means properties like "customer" crash the callout.
            true, // Never a *new* PRB (wallet) when the method is saved, so always handle actions.
          ).then(result => {
            resolve(result);
          }).catch(error => {
            reject(error);
          });
        });
    });
  }

  getCard(): StripeCardElement | null {
    if (!this.elements) {
      console.log('Stripe Elements not ready');
      return null;
    }

    const existingElement = this.elements.getElement('card');
    if (existingElement) {
      return existingElement;
    }

    return this.elements.create('card', {
      // In order to make things quicker when home & billing postcodes are the same,
      // we always collect this outside the form (defaulting to home value where appropriate)
      // so can always hide it from the Stripe form. We pass in the value we collected in
      // `confirmCardPayment()` instead.
      hidePostalCode: true,
      iconStyle: 'solid',
      style: {
        base: {
          fontFamily: 'Euclid Triangle, sans-serif',
          fontSize: '14px',
        },
      },
    });
  }

  getPaymentRequestButton(
    donation: Donation,
    resultObserver: Observer<{billingDetails: PaymentMethod.BillingDetails | undefined, walletName: string}>,
  ): StripePaymentRequestButtonElement | null {
    if (!this.elements || !this.stripe) {
      console.log('Stripe Elements not ready');
      return null;
    }

    if (this.paymentRequest) {
      this.paymentRequest.update({
        currency: donation.currencyCode.toLowerCase() || 'gbp',
        total: this.getPaymentRequestButtonTotal(donation),
        displayItems: this.getPaymentRequestButtonDisplayItems(donation),
      });
    } else {
      this.paymentRequest = this.stripe.paymentRequest({
        country: donation.countryCode || 'GB',
        currency: donation.currencyCode.toLowerCase() || 'gbp',
        total: this.getPaymentRequestButtonTotal(donation),
        displayItems: this.getPaymentRequestButtonDisplayItems(donation),
        requestPayerName: true,
        requestPayerEmail: true,
      });
    }

    // Always re-define the `on()` so that `resultObserver` is using the latest observer,
    // in the event that we re-created the PRB, and not trying to call back to a stale
    // element.
    this.paymentRequest.on('paymentmethod', (event: PaymentRequestPaymentMethodEvent) => {
      // Update fee details before confirming payment
      this.setLastCardMetadata(
        event.paymentMethod?.card?.brand,
        event.paymentMethod?.card?.country || 'N/A',
      );

      if (!donation.donationId) {
        event.complete('fail');
        console.log('No donation client secret to complete PaymentRequest');
        return;
      }

      this.paymentMethodEvents.set(donation.donationId, event);
      this.paymentMethodIds.set(donation.donationId, event.paymentMethod.id);

      // On success, let the page hide the card details & make 'Next' available.
      resultObserver.next({
        billingDetails: event.paymentMethod?.billing_details,
        walletName: event.walletName,
      });
    });

    const existingElement = this.elements.getElement('paymentRequestButton');
    if (existingElement) {
      return existingElement;
    }

    return this.elements.create('paymentRequestButton', {
      paymentRequest: this.paymentRequest,
      style: {
        paymentRequestButton: {
          type: 'donate',
        },
      },
    });
  }

  canUsePaymentRequest(): Promise<CanMakePaymentResult|null> {
    return this.paymentRequest.canMakePayment();
  }

  private getPaymentRequestButtonTotal(donation: Donation): PaymentRequestItem {
    let label = `Donation to ${donation.charityName}`;

    if (donation.tipAmount > 0) {
      label = `${label} and Big Give`;
    }

    if (donation.feeCoverAmount > 0) {
      label = `${label} and fee cover`;
    }

    return {
      label,
      // In pence/cents, inc. tip
      amount:
        parseInt((100 * donation.donationAmount).toString(), 10) +
        parseInt((100 * donation.tipAmount).toString(), 10) +
        parseInt((100 * donation.feeCoverAmount).toString(), 10),
    };
  }

  private getPaymentRequestButtonDisplayItems(donation: Donation): PaymentRequestItem[] | undefined {
    const items = [
      {
        amount: 100 * donation.donationAmount,
        label: `Donation to ${donation.charityName}`,
      },
    ];

    if (donation.tipAmount > 0) {
      items.push({
        amount: parseInt((100 * donation.tipAmount).toString(), 10),
        label: 'Donation to Big Give',
      });
    }

    if (donation.feeCoverAmount > 0) {
      items.push({
        amount: parseInt((100 * donation.feeCoverAmount).toString(), 10),
        label: 'Fee cover',
      });
    }

    return items;
  }

  private payWithMethod(donation: Donation, payment_method: any, handleActions: boolean): Promise<PaymentIntentResult> {
    return new Promise((resolve) => {
      this.stripe?.confirmCardPayment(
        donation.clientSecret as string,
        { payment_method },
        { handleActions },
      ).then(async confirmResult => {
        const analyticsEventActionPrefix = handleActions ? 'stripe_card_' : 'stripe_prb_';

        if (this.paymentError) {
          confirmResult.error = {
            charge: "ch_3N1UIEKkGuKkxwBN1KK5Qy9V",
            code: "card_declined",
            decline_code: "generic_decline",
            doc_url: "https://stripe.com/docs/error-codes/card-declined",
            message: "Your card was declined.",
            payment_intent: {
              id: "pi_3N1UIEKkGuKkxwBN1agWomFl",
              object: "payment_intent",
              amount: 575,
              canceled_at: null,
              cancellation_reason: null,
              capture_method: "automatic",
              client_secret: "pi_3N1UIEKkGuKkxwBN1agWomFl_secret_7AFGCP5jl6YXCFLFoyOJDWRNC",
              confirmation_method: "automatic",
              created: 1682599886,
              currency: "gbp",
              description: "Donation a2be860f-240c-4979-aeb9-da6866dc32e9 to Action Change (Formally GVI Trust)",
              last_payment_error: {
                charge: "ch_3N1UIEKkGuKkxwBN1KK5Qy9V",
                code: "card_declined",
                decline_code: "generic_decline",
                doc_url: "https://stripe.com/docs/error-codes/card-declined",
                message: "Your card was declined.",
                payment_method: {
                  id: "pm_1N1RbcKkGuKkxwBNWQ0Jwtxy",
                  object: "payment_method",
                  billing_details: {
                    address: {
                      city: null,
                      country: "GB",
                      line1: null,
                      line2: null,
                      postal_code: "SE16 2HW",
                      state: null
                    },
                    email: "djhawro@gmail.com",
                    name: "Dorota Hawro",
                    phone: null
                  },
                  metadata: {},
                  card: {
                    brand: "visa",
                    checks: {
                      address_line1_check: null,
                      address_postal_code_check: null,
                      cvc_check: null
                    },
                    country: "GB",
                    exp_month: 2,
                    exp_year: 2028,
                    funding: "debit",

                    last4: "6014",
                    three_d_secure_usage: {
                      supported: true
                    },
                    wallet: null
                  },
                  created: 1682589557,
                  customer: "cus_NkQ8PKqqBKmXMZ",
                  livemode: true,
                  type: "card"
                },
                type: "card_error"
              },
              livemode: true,
              next_action: null,
              payment_method: null,
              payment_method_types: [
                "card"
              ],
              receipt_email: null,
              setup_future_usage: "on_session",
              shipping: null,
              status: "requires_payment_method"
            },
            payment_method: {
              id: "pm_1N1RbcKkGuKkxwBNWQ0Jwtxy",
              object: "payment_method",
              billing_details: {
                address: {
                  city: null,
                  country: "GB",
                  line1: null,
                  line2: null,
                  postal_code: "SE16 2HW",
                  state: null
                },
                email: "djhawro@gmail.com",
                name: "Dorota Hawro",
                phone: null
              },
              metadata: {},
              card: {
                brand: "visa",
                checks: {
                  address_line1_check: null,
                  address_postal_code_check: null,
                  cvc_check: null
                },
                country: "GB",
                exp_month: 2,
                exp_year: 2028,
                funding: "debit",
                last4: "6014",
                three_d_secure_usage: {
                  supported: true
                },
                wallet: null
              },
              created: 1682589557,
              customer: "cus_NkQ8PKqqBKmXMZ",
              livemode: true,
              type: "card"
            },
            type: "card_error"
          };
          this.paymentError = false;
        }


        if (confirmResult.error) {
          // Failure w/ no extra action applicable
          this.analyticsService.logError(
            `${analyticsEventActionPrefix}payment_error`,
            confirmResult.error.message ?? '[No message]',
          );

          if (donation.donationId) {
            // Ensure we don't try to re-use the same payment method, as with PRBs it seemingly gets "disconnected"
            // from the Customer and retries fail.
            this.paymentMethodIds.delete(donation.donationId);
          }

          resolve(confirmResult);
          return;
        }

        if (confirmResult.paymentIntent.status !== 'requires_action') {
          // Success w/ no extra action needed
          this.analyticsService.logEvent(
            `${analyticsEventActionPrefix}payment_success`,
            `Stripe Intent processing or done for donation ${donation.donationId} to campaign ${donation.projectId}`,
          );

          resolve(confirmResult);
          return;
        }

        // The PaymentIntent requires an action e.g. 3DS verification; let Stripe.js handle the flow.
        this.analyticsService.logEvent(`${analyticsEventActionPrefix}requires_action`, confirmResult.paymentIntent.next_action?.type ?? '[Action unknown]');
        this.stripe?.confirmCardPayment(donation.clientSecret || '').then(confirmAgainResult => {
          if (confirmAgainResult.error) {
            if (donation.donationId) {
              this.paymentMethodIds.delete(donation.donationId); // As above
            }
            this.analyticsService.logError(`${analyticsEventActionPrefix}further_action_error`, confirmAgainResult.error.message ?? '[No message]');
          }

          // Extra action done, whether successfully or not.
          resolve(confirmAgainResult);
        });
      });
    });
  }
}
