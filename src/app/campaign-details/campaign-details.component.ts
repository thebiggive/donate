import { Component, OnInit } from '@angular/core';
import { DomSanitizer, makeStateKey, SafeResourceUrl, TransferState } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { Campaign } from '../campaign.model';
import { CampaignService } from '../campaign.service';
import { PageMetaService } from '../page-meta.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.component.html',
  styleUrls: ['./campaign-details.component.scss'],
})
export class CampaignDetailsComponent implements OnInit {
  public campaign: Campaign;
  public campaignId: string;
  public clientSide: boolean;
  public donateEnabled = true;
  public fromFund = false;
  public percentRaised?: number;
  public videoEmbedUrl?: SafeResourceUrl;

  constructor(
    private campaignService: CampaignService,
    private pageMeta: PageMetaService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private state: TransferState,
  ) {
    route.params.pipe().subscribe(params => this.campaignId = params.campaignId);
    route.queryParams.forEach((params: Params) => {
      if (params.fromFund) {
        this.fromFund = true;
      }
    });
  }

  ngOnInit() {
    const campaignKey = makeStateKey<Campaign>(`campaign-${this.campaignId}`);
    this.campaign = this.state.get(campaignKey, undefined);

    if (this.campaign) {
      this.setSecondaryProps(this.campaign);
    } else {
      this.campaignService.getOneById(this.campaignId).subscribe(campaign => {
        this.state.set(campaignKey, campaign);
        this.campaign = campaign;
        this.setSecondaryProps(campaign);
      });
    }
  }

  private setSecondaryProps(campaign: Campaign) {
    this.donateEnabled = CampaignService.isOpenForDonations(campaign);
    this.percentRaised = CampaignService.percentRaised(campaign);

    let summaryStart;
    if (campaign.summary) {
      // First 20 word-like things followed by …
      summaryStart = campaign.summary.replace(new RegExp('^(([\\w\',."-]+ ){20}).*$'), '$1') + '…';
    } else {
      summaryStart = `${campaign.charity.name}'s campaign, ${campaign.title}`;
    }
    this.pageMeta.setCommon(campaign.title, summaryStart, campaign.bannerUri);

    // As per https://angular.io/guide/security#bypass-security-apis constructing `SafeResourceUrl`s with these appends should be safe.
    if (campaign.video && campaign.video.provider === 'youtube') {
      this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${campaign.video.key}`);
    } else if (campaign.video && campaign.video.provider === 'vimeo') {
      this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${campaign.video.key}`);
    }
  }
}
