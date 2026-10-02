import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Facultatif depuis Angular 21 (HttpClient est fourni par défaut),
    // mais on l'écrit pour voir d'où vient le HTTP utilisé par httpResource.
    provideHttpClient(),
    // withComponentInputBinding : les paramètres d'URL arrivent dans les input().
    provideRouter(routes, withComponentInputBinding()),
  ],
};
