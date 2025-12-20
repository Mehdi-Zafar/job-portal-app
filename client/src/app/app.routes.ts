import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SignIn } from './pages/sign-in/sign-in';
import { SignUp } from './pages/sign-up/sign-up';
import { AuthLayout } from './shared/layouts/auth-layout/auth-layout';
import { PublicNoNavLayout } from './shared/layouts/public-no-nav-layout/public-no-nav-layout';
import { PublicWithNavLayout } from './shared/layouts/public-with-nav-layout/public-with-nav-layout';
import { FindJobs } from './pages/find-jobs/find-jobs';
import { PostJob } from './pages/post-job/post-job';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { ResetPassword } from './pages/reset-password/reset-password';
import { PublicOnlyGuard } from './core/guards/publicOnly.guard';
import { AuthGuard } from './core/guards/auth.guard';

// app.routes.ts
export const routes: Routes = [
  // Public routes - resolve auth first
  {
    path: '',
    children: [
      // Public with navbar
      {
        path: '',
        component: PublicWithNavLayout,
        children: [
          { path: '', component: Home },
          { path: 'contact', component: Contact },
          { path: 'about', component: About },
          { path: 'find-jobs', component: FindJobs },
        ],
      },

      // Public without navbar
      {
        path: '',
        component: PublicNoNavLayout,
        canActivate: [PublicOnlyGuard],
        children: [
          { path: 'sign-in', component: SignIn },
          { path: 'sign-up', component: SignUp },
          { path: 'forgot-password', component: ForgotPassword },
          { path: 'reset-password/:token', component: ResetPassword },
          { path: 'verify-email/:token', component: VerifyEmail },
        ],
      },

      // Protected routes
      {
        path: '',
        component: AuthLayout,
        canActivate: [AuthGuard],
        children: [{ path: 'post-job', component: PostJob }],
      },
    ],
  },

  // Wildcard route
  { path: '**', redirectTo: '' },
];
