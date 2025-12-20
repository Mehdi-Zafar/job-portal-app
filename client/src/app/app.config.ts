import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

function initializeApp() {
  const authService = inject(AuthService);
  return authService.initializeFromRefreshToken();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAppInitializer(initializeApp),
    provideAnimations(), // ✅ Enables animations for Angular
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),
  ]
};
