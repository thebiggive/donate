import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CampaignDetailsComponent } from './campaign-details/campaign-details.component';
import { CharityCampaignsResolver } from './charity-campaigns.resolver';
import { CharityComponent } from './charity/charity.component';
import { DonationCompleteComponent } from './donation-complete/donation-complete.component';
import { DonationStartComponent } from './donation-start/donation-start.component';
import { environment } from '../environments/environment';
import { ExploreComponent } from './explore/explore.component';
import { HomeComponent } from './home/home.component';
import { MetaCampaignComponent } from './meta-campaign/meta-campaign.component';

const routes: Routes = [
  {
    path: 'campaign/:campaignId',
    component: CampaignDetailsComponent,
  },
  {
    path: 'charity/:charityId',
    component: CharityComponent,
    resolve: {
      campaigns: CharityCampaignsResolver,
    },
  },
  {
    path: 'donate/:campaignId',
    component: DonationStartComponent,
  },
  {
    path: 'metacampaign/:campaignId',
    component: MetaCampaignComponent,
  },
  {
    path: 'metacampaign/:campaignId/:fundSlug',
    component: MetaCampaignComponent,
  },
  {
    path: 'thanks/:donationId',
    component: DonationCompleteComponent,
  },
  {
    path: ':campaignSlug/:fundSlug',
    component: MetaCampaignComponent,
  },
  {
    path: 'explore',
    component: ExploreComponent,
  },
  {
    path: ':campaignSlug',
    component: MetaCampaignComponent,
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    onSameUrlNavigation: 'reload', // Allows Explore & home logo links to clear search filters in ExploreComponent
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
})],
  providers: [CharityCampaignsResolver],
  exports: [RouterModule],
})
export class AppRoutingModule {}
