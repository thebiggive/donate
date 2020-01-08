import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { environment } from '../environments/environment';

declare var _gscq: {
  push: (...args: string[][]) => void,
};

/**
 * GetSiteControl JS is injected to provide social, cookie & feedback widgets.
 */
@Injectable({
  providedIn: 'root',
})
export class GetSiteControlService {

  constructor(private router: Router) {}

  init() {
    this.listenForRouteChanges();

    const scriptInitGSC = document.createElement('script');
    scriptInitGSC.async = true;
    scriptInitGSC.src = `https://widgets.getsitecontrol.com/${environment.getSiteControlId}/script.js`;
    document.head.appendChild(scriptInitGSC);

    const scriptConfigureGSC = document.createElement('script');
    scriptConfigureGSC.innerHTML = `
      window._gscq=window._gscq||[];
    `;
    document.head.appendChild(scriptConfigureGSC);
  }

  private listenForRouteChanges() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (!_gscq) {
          return; // Skip the call gracefully if loading fails or 3rd party JS is blocked.
        }

        _gscq.push(['trackPage', event.urlAfterRedirects]);
      }
    });
  }
}
