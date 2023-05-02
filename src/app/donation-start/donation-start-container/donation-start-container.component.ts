import {AfterContentChecked, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Campaign} from "../../campaign.model";
import {isPlatformBrowser} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import { Donation } from 'src/app/donation.model';
import {DonationStartPrimaryComponent} from "../donation-start-primary/donation-start-primary.component";
import {Person} from "../../person.model";
import {IdentityService} from "../../identity.service";
@Component({
  templateUrl: './donation-start-container.component.html',
  styleUrls: ['./donation-start-container.component.scss']
})
export class DonationStartContainerComponent implements OnInit{
  campaign: Campaign;
  donation: Donation;
  personId?: string;
  personIsLoginReady = false;
  loggedInEmailAddress?: string;


  @ViewChild('donation_start_form') donationStartForm: DonationStartPrimaryComponent

  constructor(
    private route: ActivatedRoute,
    private identityService: IdentityService,
  ) {
  }

   ngOnInit() {
    this.campaign = this.route.snapshot.data.campaign;
     const idAndJWT = this.identityService.getIdAndJWT();
     if (idAndJWT) {
       this.loadAuthedPersonInfo(idAndJWT.id, idAndJWT.jwt);
     }
  }

  logout = () => {
    this.personId = undefined;
    // could just pass donationStartForm.reset directly to the logout button,
    // but we may well want to do more work here very soon.
    this.donationStartForm.reset();
  }

  loadAuthedPersonInfo = (id: string, jwt: string) => {
    if (!this.identityService) {
      // This feels like an anti-pattern, but currently seems to be required. Since the "contained"
      // login component is passed this public fn and could call it any time, it is not safe to assume
      // that this page has its normal service dependencies. The current behaviour post-login seems to
      // be that this is called as a no-op once, but then there's a reload during which it works?

      return;
    }

    this.identityService.get(id, jwt).subscribe((person: Person) => {
      this.personId = person.id; // Should mean donations are attached to the Stripe Customer.
      this.personIsLoginReady = true;
      this.loggedInEmailAddress = person.email_address;
      this.donationStartForm.loadPerson(person, id, jwt);
    });
  };

  get canLogin() {
    return !this.personId;
  }
}