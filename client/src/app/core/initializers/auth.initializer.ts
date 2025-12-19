// // src/app/core/initializers/auth.initializer.ts
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { Observable } from 'rxjs';

// export function initializeAuth() {
//   const authService = inject(AuthService);

//   return (): Observable<boolean> => {
//     // Try to get new access token from refresh token cookie
//     return authService.initializeFromRefreshToken();
//   };
// }