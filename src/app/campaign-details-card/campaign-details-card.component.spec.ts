import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterTestingModule } from '@angular/router/testing';

import { Campaign } from '../campaign.model';
import { CampaignDetailsCardComponent } from './campaign-details-card.component';

describe('CampaignDetailsCardComponent', () => {
  let component: CampaignDetailsCardComponent;
  let fixture: ComponentFixture<CampaignDetailsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatSelectModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignDetailsCardComponent);
    component = fixture.componentInstance;
    component.campaign = new Campaign(
      'testCampaignId',
      ['Aim 1'],
      123,
      [],
      'https://example.com/banner.png',
      ['Other'],
      [],
      ['Animals'],
      'Some Champion',
      {
        id: 'testCharityId',
        name: 'Test Charity',
        donateLinkId: 'SFIdOrLegacyId',
        optInStatement: 'Opt in statement.',
        website: 'https://www.testcharity.co.uk',
        regulatorNumber: '123456',
        regulatorRegion: 'Scotland',
      },
      ['United Kingdom'],
      'GBP',
      4,
      new Date(),
      'Impact reporting plan',
      'Impact overview',
      true,
      987,
      988,
      'The situation',
      [],
      true,
      'The solution',
      new Date(),
      'Active',
      'Test campaign description',
      1234,
      'Test Campaign!',
      [],
      'Some information about what happens if funds are not used',
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
