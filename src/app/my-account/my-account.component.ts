import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import {PageMetaService} from '../page-meta.service';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {IdentityService} from "../identity.service";
import {Person} from "../person.model";
import {Router} from "@angular/router";
import {PaymentMethod} from "@stripe/stripe-js";
import {DonationService} from "../donation.service";
import {UpdateCardModalComponent} from "../update-card-modal/update-card-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import { HttpErrorResponse } from "@angular/common/http";
import {flags} from "../featureFlags";
import { HighlightCard } from '../highlight-cards/HighlightCard';
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
  providers: [DatePipe]
})
export class MyAccountComponent implements OnDestroy, OnInit {
  public person: Person;

  public paymentMethods: PaymentMethod[]|undefined = undefined;
  registerErrorDescription: string | undefined;
  registerSucessMessage: string | undefined;
  protected readonly faExclamationTriangle = faExclamationTriangle;

  private savedCardsTimer: undefined | ReturnType<typeof setTimeout>; // https://stackoverflow.com/a/56239226
  protected readonly flags = flags;

  protected readonly actions: HighlightCard[];

  constructor(
    private pageMeta: PageMetaService,
    public dialog: MatDialog,
    private identityService: IdentityService,
    private donationService: DonationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {
    this.identityService = identityService;

    this.actions = [
      {
        background: {
          color: 'brand-mhf-turquoise',
          image: new URL(environment.donateUriPrefix + '/assets/images/turquoise-texture.jpg')
        },
        headerText: 'Transfer Donation Funds',
        bodyText: 'Use a bank transfer to make donations to charities on our platform.',
        button: {
          text: '',
          href: new URL(environment.donateUriPrefix + '/transfer-funds')
        }
      },
      {
        background: {
          color: 'brand-c4c-orange',
          image: new URL(environment.donateUriPrefix + '/assets/images/red-coral-texture.png')
        },
        headerText: 'Your donations',
        bodyText: 'View all the donations you\'ve made while logged in',
        button: {
          text: '',
          href: new URL(environment.donateUriPrefix + '/my-account/donations')
        }
      },
    ];
    if (flags.regularGivingEnabled) {
      this.actions.push(
        {
          background: {
            color: 'brand-afa-pink',
            image: new URL(environment.donateUriPrefix + '/assets/images/peach-texture.jpg')
          },
          headerText: 'Your Regular Giving',
          bodyText: 'View and manage your regular giving mandates',
          button: {
            text: '',
            href: new URL(environment.donateUriPrefix + '/my-account/regular-giving')
          }
      })
    }
  }

  ngOnInit() {
    this.pageMeta.setCommon(
      'Big Give - My account',
      'Big Give – discover campaigns and donate',
      'https://images-production.thebiggive.org.uk/0011r00002IMRknAAH/CCampaign%20Banner/db3faeb1-d20d-4747-bb80-1ae9286336a3.jpg',
    );

    this.identityService.getLoggedInPerson().subscribe(async (person: Person|null) => {
      if (! person) {
        await this.router.navigate(['']);
      } else {
        this.person = person;
        this.loadPaymentMethods();

        if (isPlatformBrowser(this.platformId)) {
          this.savedCardsTimer = setTimeout(this.checkForPaymentCardsIfNotLoaded, 5_000);
        }
      }
    });
  }

  protected get hasSavedPaymentMethods()
  {
    return this.paymentMethods !== undefined && this.paymentMethods.length > 0;
  }

  /**
   * We only check for GBP balances for now, as we only support UK bank transfers rn
   */
  protected get hasDonationFunds()
  {
    return this.person.cash_balance?.gbp
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.savedCardsTimer) {
      clearTimeout(this.savedCardsTimer);
    }
  }

  loadPaymentMethods() {
    // not so keen on the component using the donation service and the identity service together like this
    // would rather call one service and have it do everything for us. Not sure what service would be best to put
    // this code in.
    this.donationService.getPaymentMethods(this.person.id, this.jwtAsString(), {cacheBust: true})
      .subscribe((response: { data: PaymentMethod[] }) => {
          this.paymentMethods = response.data;
        }
      );
  }

  deleteMethod(method: PaymentMethod) {
    this.paymentMethods = undefined;

    this.donationService.deleteStripePaymentMethod(this.person, method, this.jwtAsString()).subscribe(
      this.loadPaymentMethods.bind(this),
      error => {
        this.loadPaymentMethods.bind(this)()
        alert(error.error.error)
      }
    )
  }

  private jwtAsString() {
    return this.identityService.getJWT() as string;
  }

  updateCard(methodId: string, card: PaymentMethod.Card, billingDetails: PaymentMethod.BillingDetails) {
    const updateCardDialog = this.dialog.open(UpdateCardModalComponent);
    updateCardDialog.componentInstance.setPaymentMethod(card, billingDetails);
    updateCardDialog.afterClosed().subscribe((data: unknown) => {
      if (data === "null") {
        return;
      }

      const formValue = updateCardDialog.componentInstance.form.value;

      const paymentMethodsBeforeUpdate = this.paymentMethods;
      this.paymentMethods = undefined;
      this.donationService.updatePaymentMethod(
        this.person,
        this.jwtAsString(),
        methodId,
        {
          expiry: this.parseExpiryDate(formValue.expiryDate),
          countryCode: (formValue.billingCountry),
          postalCode: formValue.postalCode,
        }
      ).subscribe({
        next: () => {
          this.registerSucessMessage = "Saved new details for card ending " + card.last4;
          this.registerErrorDescription = undefined;
          this.loadPaymentMethods()
        },
        error: (resp: HttpErrorResponse)  => {
          this.registerSucessMessage = undefined;
          this.registerErrorDescription = resp.error.error ?
            `Could not update card ending ${card.last4}. ${resp.error.error}` :
            ("Sorry, update failed for card ending " + card.last4)
          this.paymentMethods = paymentMethodsBeforeUpdate;
        },
    })
    })
  }

  private parseExpiryDate(expiryDate: string): {year: number, month: number} {
    const [month, year] = expiryDate.split('/')
      .map((number: string) => parseInt(number));

    if (! year) {
      throw new Error("Failed to parse expiry date, missing year");
    }


    if (! month) {
      throw new Error("Failed to parse expiry date, missing month");
    }

    return {year, month}
  }

    /**
     * To work around a bug where it seems sometimes new payment cards are not showing on this page, if there are none
     * loaded at this point we check again with the server.
     */
    private checkForPaymentCardsIfNotLoaded = () => {
        if (this.paymentMethods && this.paymentMethods.length > 0) {
          return;
        }

        this.loadPaymentMethods();
    };
}
