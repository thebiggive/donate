import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { CampaignService } from './campaign.service';
import { EMPTY, Observable, of } from 'rxjs';
import { CampaignSummary } from './campaign-summary.model';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CharityCampaignsResolver implements Resolve<any> {
  constructor(private campaignService: CampaignService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CampaignSummary[]> {
    const charityId = route.paramMap.get('charityId');

    // Edge case for our legacy redirector seems to have returned string 'null' as the
    // SF ID for some charities. So we should check for this and treat it as blank too.
    if (!charityId || charityId === 'null') {
      return of([]);
    }

    return this.campaignService.getForCharity(charityId)
      .pipe(catchError(error => {
        console.log(`CharityCampaignsResolver load error: "${error.message}"`);
        return EMPTY;
      }));
  }
}
