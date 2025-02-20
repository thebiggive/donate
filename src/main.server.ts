import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

if (environment.productionLike) {
  enableProdMode();
}

export { AppServerModule as default } from './app/app.server.module';
