import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

import { AppModule } from './app/app.module';

// Enregistrer les données de localisation française
registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
