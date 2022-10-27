import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RECAPTCHA_NONCE } from 'ng-recaptcha';
import { LOCAL_STORAGE } from 'ngx-webstorage-service';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing';
import { TBG_DONATE_STORAGE } from './app/donation.service';
import { TBG_DONATE_ID_STORAGE } from './app/identity.service';
import { environment } from './environments/environment';

if (environment.productionLike) {
  enableProdMode();
}

globalThis.document.addEventListener('DOMContentLoaded', () => {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(RouterModule.forRoot(routes)),
      // In Universal / SSR mode, `APP_BASE_HREF` should vary according to the host reported
      // by the browser once client side JS takes over. This is necessary so we can successfully
      // serve the app on multiple live domains.
      {
        provide: APP_BASE_HREF, 
        useFactory: () => {
          const globalDonateHost = (new URL(environment.donateGlobalUriPrefix)).host;
          const host = (typeof window === 'undefined' ? '' : window.location.host);

          return host === globalDonateHost
            ? environment.donateGlobalUriPrefix
            : environment.donateUriPrefix;
        },
      },
      { provide: TBG_DONATE_ID_STORAGE, useExisting: LOCAL_STORAGE },
      { provide: TBG_DONATE_STORAGE, useExisting: LOCAL_STORAGE },
      { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { color: 'primary' } },
      { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'primary' } },
      { provide: RECAPTCHA_NONCE, useValue: environment.recaptchaNonce },
    ]
  })
  .catch(err => console.error(err));
});
