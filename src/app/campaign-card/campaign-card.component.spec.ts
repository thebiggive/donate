import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CampaignCardComponent } from './campaign-card.component';
import { CampaignSummary } from '../campaign-summary.model';

describe('CampaignCardComponent', () => {
  let component: CampaignCardComponent;
  let fixture: ComponentFixture<CampaignCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
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
    fixture = TestBed.createComponent(CampaignCardComponent);
    component = fixture.componentInstance;
    component.campaign = new CampaignSummary(
      'testCampaignId',
      123,
      ['Other'],
      ['Animals'],
      'Test Champion',
      { id: 'testCharityId', name: 'Test Charity' },
      'GBP',
      [],
      new Date(),
      'https://example.com/image.png',
      true,
      400,
      new Date(),
      'Active',
      1230,
      'Test Campaign!',
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load key data from test campaign', () => {
    expect(component.campaign.title).toBe('Test Campaign!');
    expect(component.campaign.isMatched).toBe(true);
    expect(component.campaign.charity.name).toBe('Test Charity');
  });
});
