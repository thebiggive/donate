import { Component, Input, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { allChildComponentImports } from '../../allChildComponentImports';
import { Campaign } from '../campaign.model';
import { CampaignGroupsService } from '../campaign-groups.service';
import { CampaignService } from '../campaign.service';
import { ImageService } from '../image.service';
import { MatIconModule } from '@angular/material/icon';
import { TimeLeftPipe } from '../time-left.pipe';

@Component({
  standalone: true,
  selector: 'app-campaign-details-card',
  templateUrl: './campaign-details-card.component.html',
  styleUrls: ['./campaign-details-card.component.scss'],
  imports: [
    ...allChildComponentImports,
    FontAwesomeModule,
    MatIconModule,
    MatProgressBarModule,
    TimeLeftPipe,
  ],
})
export class CampaignDetailsCardComponent implements OnInit {
  @Input() campaign: Campaign;
  bannerUri: string|null = null;
  percentRaised?: number;

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    this.percentRaised = CampaignService.percentRaised(this.campaign);
    this.imageService.getImageUri(this.campaign.bannerUri, 830).subscribe(uri => this.bannerUri = uri);
  }

  getBeneficiaryIcon(beneficiary: string) {
    return CampaignGroupsService.getBeneficiaryIcon(beneficiary);
  }

  getCategoryIcon(category: string) {
    return CampaignGroupsService.getCategoryIcon(category);
  }

  locations(): string|null {
    if (this.campaign.countries.length > 1) {
      return 'Multiple locations';
    }

    return this.campaign.countries[0]!;
  }
}
