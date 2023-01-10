import {DatePipe, PercentPipe} from '@angular/common';
import { NgModule } from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyOptionModule as MatOptionModule} from '@angular/material/legacy-core';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatStepperModule} from '@angular/material/stepper';
import {ReactiveFormsModule} from '@angular/forms';
import {RecaptchaModule} from 'ng-recaptcha';

import { allChildComponentImports } from '../../allChildComponentImports';
import {CampaignDetailsCardComponent} from '../campaign-details-card/campaign-details-card.component';
import { DonationStartComponent } from './donation-start.component';
import {DonationStartRoutingModule} from './donation-start-routing.module';
import {ExactCurrencyPipe} from '../exact-currency.pipe';
import {TimeLeftPipe} from '../time-left.pipe';

@NgModule({
  imports: [
    ...allChildComponentImports,
    CampaignDetailsCardComponent,
    DonationStartRoutingModule,
    ExactCurrencyPipe,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatStepperModule,
    PercentPipe,
    ReactiveFormsModule,
    RecaptchaModule,
    TimeLeftPipe,
  ],
  declarations: [DonationStartComponent],
  providers: [
    DatePipe,
  ]
})
export class DonationStartModule {}
