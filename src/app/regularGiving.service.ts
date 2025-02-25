import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Mandate} from "./mandate.model";
import {getPersonAuthHttpOptions, IdentityService} from "./identity.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../environments/environment";
import {map, switchMap} from "rxjs/operators";
import {PaymentIntent, PaymentMethod} from '@stripe/stripe-js';

/**
 * Details of a desired new regular giving mandate sent to Matchbot to create it. Deseralized on the matchbot side
 * to class MandateCreate: https://github.com/thebiggive/matchbot/blob/main/src/Application/HttpModels/MandateCreate.php
 */
export type StartMandateParams = {
  amountInPence: number,
  currency: 'GBP',
  dayOfMonth: number,
  campaignId: string,
  giftAid: boolean,

  /** @deprecated pass home instead */
  homeAddress: string | null,

  /** @deprecated pass home instead */
  homePostcode: string | null,

  /** Home address details used for Gift Aid claim. Should only be included if GA is selected. */
  home?: {
    addressLine1: string
    postcode: string,
    isOutsideUK: boolean,
  }

  /** ISO-2 code for country. Must match that on the DonorAccount if the latter is non-null */
  billingCountry: string,

  /** Must be null or match postcode on the DonorAccount if the latter is non-null */
  billingPostcode: string | null,

  /** Should only be set if the donor previously had no payment
   * method selected on their account for regular-giving use, as the payment method is common to all regular giving
   * agreements for the account. If it needs to changed that will be handled at the account, rather than as part of
   * a mandate.
   */
  stripeConfirmationTokenId?: string,

  /** Whether the Donor wants to receive marketing emails from Big Give */
  tbgComms: boolean,

  /** Whether the Donor wants to receive marketing emails from the charity they donate to with this mandate */
  charityComms: boolean,

  /** Whether the Donor is happy to donate without having their donations matched */
  unmatched?: boolean,
};

type PersonAuthHttpOptions = {headers: HttpHeaders };
export type MandateCreateResponse = {mandate: Mandate, paymentIntent: undefined | { status: 'requires_action', client_secret: string }}

@Injectable({
  providedIn: 'root',
})
export class RegularGivingService {
  constructor(
    private http: HttpClient,
    private identityService: IdentityService,
  ) {}

  public startMandate(mandate: StartMandateParams): Observable<MandateCreateResponse> {
    return this.withLoggedInDonor((personAuthHttpOptions: PersonAuthHttpOptions) => {
      const IDAndJWT = this.identityService.getIdAndJWT()!;
      return this.http.post<unknown>(
        `${environment.donationsApiPrefix}/people/${IDAndJWT.id}/regular-giving`,
        mandate,
        personAuthHttpOptions,
      ) as Observable<MandateCreateResponse>;
    });
  }


  public getActiveMandates() {
      return this.withLoggedInDonor((personAuthHttpOptions: PersonAuthHttpOptions) => {
      return this.http.get<{ mandates: Mandate[] }>(
        `${environment.donationsApiPrefix}/regular-giving/my-donation-mandates`,
        personAuthHttpOptions,
      ).pipe(map((response) => response.mandates));
    });
  }

  public getActiveMandate(mandateId: string) {
    return this.withLoggedInDonor((personAuthHttpOptions: PersonAuthHttpOptions) => {
      return this.http.get<{ mandate: Mandate }>(
        `${environment.donationsApiPrefix}/regular-giving/my-donation-mandates/${mandateId}`,
        personAuthHttpOptions,
      ).pipe(map((response) => response.mandate));
    });
  }

  public cancel(mandate: Mandate, {cancellationReason}: {cancellationReason: string}): Observable<unknown> {
    return this.withLoggedInDonor((personAuthHttpOptions: PersonAuthHttpOptions) => {
      return this.http.post(
        `${environment.donationsApiPrefix}/regular-giving/my-donation-mandates/${mandate.id}/cancel`,
        {
          cancellationReason: cancellationReason,
          mandateUUID: mandate.id
        },
        personAuthHttpOptions
      )
    })
  }

  private withLoggedInDonor<T extends (personAuthHttpOptions: PersonAuthHttpOptions) => Observable<unknown>>(callable: T): ReturnType<T> {
    const jwt = this.identityService.getJWT();
    const person$ = this.identityService.getLoggedInPerson();
    const personAuthHttpOptions = getPersonAuthHttpOptions(jwt);

    // @ts-expect-error currently getting `Type Observable<unknown> is not assignable to type ReturnType<T>` .
    // Maybe ok to leave for now.
    return person$.pipe(switchMap((person) => {
      if (!person) {
        throw new Error("logged in person required");
      }

      return callable(personAuthHttpOptions);
    }));
  }
}
