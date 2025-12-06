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

export const routes: Routes = [
  {
    path: '',
    component: PublicWithNavLayout,
    children: [
      { path: '', component: Home }, // landing / home
      { path: 'contact', component: Contact }, // landing / home
      { path: 'about', component: About }, // landing / home
      { path: 'find-jobs', component: FindJobs },
      //   { path: 'jobs', component: JobListComponent },
      //   { path: 'jobs/:id', component: JobDetailComponent },
      // ... any other public browsing/search pages
    ],
  },

  // Public pages WITHOUT navbar
  {
    path: '',
    component: PublicNoNavLayout,
    children: [
      { path: 'sign-in', component: SignIn },
      { path: 'sign-up', component: SignUp },
    ],
  },

  // Protected / authenticated pages (WITH navbar)
  {
    path: '',
    component: AuthLayout,
    // canActivate: [AuthGuard],   // or canActivateChild etc.
    children: [
      { path: 'post-job', component: PostJob },
      //   { path: 'my-applications', component: ApplicationsComponent },
      // ... other secured routes
    ],
  },

  // optionally a fallback
  { path: '**', redirectTo: '' },
];
