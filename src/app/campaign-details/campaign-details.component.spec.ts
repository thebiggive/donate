import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { Campaign } from '../campaign.model';
import { CampaignDetailsCardComponent } from '../campaign-details-card/campaign-details-card.component';
import { CampaignDetailsComponent } from './campaign-details.component';
import { TimeLeftPipe } from '../time-left.pipe';

describe('CampaignDetailsComponent', () => {
  let component: CampaignDetailsComponent;
  let fixture: ComponentFixture<CampaignDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignDetailsComponent, CampaignDetailsCardComponent, TimeLeftPipe ],
      imports: [
        BrowserTransferStateModule,
        HttpClientTestingModule,
        MatIconModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignDetailsComponent);
    component = fixture.componentInstance;
    component.campaign = new Campaign(
      'testCampaignId',
      ['Aim 1'],
      123,
      [],
      'https://example.com/banner.png',
      [],
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
      {
        charityOptIn: 'Yes, I\'m happy to receive emails from',
        charityOptOut: 'No, I would not like to receive emails from',
        charityOptOutMessage: 'Please note that you might continue to receive communications from the charity if you have already shared your details with them via other methods.',
        tbgOptIn: 'Yes, I\'m happy to receive emails from',
        tbgOptOut: 'No, I would not like to receive emails from',
        tbgOptOutMessage: 'By selecting \'no\', we will no longer be able to email you about opportunities to double your donation.',
        championOptIn: 'Yes, I\'m happy to receive emails from',
        championOptOut: 'No, I would not like to receive emails from',
        championOptOutMessage: 'Please note that you might continue to receive communications from the champion if you have already shared your details with them via other methods.',
      },
      4,
      new Date(),
      [],
      'Impact reporting plan',
      'Impact overview',
      true,
      987,
      988,
      'The situation',
      [],
      'The solution',
      new Date(),
      'Active',
      'Test campaign description',
      1234,
      'Test Campaign!',
      [],
      'Some information about what happens if funds are not used',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        provider: 'youtube',
        key: 'someFakeKey',
      },
    );
    // For now, *don't* detect changes as ngOnInit() will clear out the fixed `campaign` trying to
    // read a value from the state transfer service. TODO it would be better to mock an HTTP response
    // instead so the data is loaded in a more realistic way.
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load key data from test campaign', () => {
    if (!component.campaign) {
      expect(false).toBeTrue(); // campaign unexpectedly undefined
      return;
    }
    expect(component.campaign.title).toBe('Test Campaign!');
    expect(component.campaign.isMatched).toBe(true);
    expect(component.campaign.charity.name).toBe('Test Charity');
    expect(component.campaign.aims[0]).toBe('Aim 1');
    expect(component.campaign.video).toBeDefined();
    if (component.campaign.video) {
      expect(component.campaign.video.provider).toBe('youtube');
    } else {
      expect(false).toBeTrue(); // video unexpectedly undefined
    }
  });
});
