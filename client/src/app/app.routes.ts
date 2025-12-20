import { Routes } from '@angular/router';
import { AuthLayout } from './shared/layouts/auth-layout/auth-layout';
import { PublicNoNavLayout } from './shared/layouts/public-no-nav-layout/public-no-nav-layout';
import { PublicWithNavLayout } from './shared/layouts/public-with-nav-layout/public-with-nav-layout';
import { PublicOnlyGuard } from './core/guards/publicOnly.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user.model';

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
          { 
            path: '', 
            loadComponent: () => import('./pages/home/home').then((m) => m.Home) 
          },
          {
            path: 'contact',
            loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
          },
          {
            path: 'about',
            loadComponent: () => import('./pages/about/about').then((m) => m.About),
          },
          {
            path: 'find-jobs',
            loadComponent: () => import('./pages/find-jobs/find-jobs').then((m) => m.FindJobs),
          },
        ],
      },

      // Public without navbar
      {
        path: '',
        component: PublicNoNavLayout,
        canActivate: [PublicOnlyGuard],
        children: [
          {
            path: 'sign-in',
            loadComponent: () => import('./pages/sign-in/sign-in').then((m) => m.SignIn),
          },
          {
            path: 'sign-up',
            loadComponent: () => import('./pages/sign-up/sign-up').then((m) => m.SignUp),
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
          },
          {
            path: 'reset-password/:token',
            loadComponent: () =>
              import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
          },
          {
            path: 'verify-email/:token',
            loadComponent: () =>
              import('./pages/verify-email/verify-email').then((m) => m.VerifyEmail),
          },
        ],
      },

      // Protected routes (migrated from old auth layout)
      {
        path: '',
        component: AuthLayout,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'post-job',
            loadComponent: () => import('./pages/post-job/post-job').then((m) => m.PostJob),
          },
        ],
      },

      // Applicant routes
      {
        path: 'applicant',
        canActivate: [AuthGuard, RoleGuard([Role.APPLICANT])],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./shared/layouts/applicant-layout/applicant-layout').then(
                (m) => m.ApplicantLayout
              ),
            children: [
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./pages/applicant/dashboard/dashboard').then(
                    (m) => m.Dashboard
                  ),
              },
              {
                path: 'profile',
                loadComponent: () =>
                  import('./pages/applicant/profile/profile').then(
                    (m) => m.Profile
                  ),
              },
              {
                path: 'resume',
                loadComponent: () =>
                  import('./pages/applicant/resume/resume').then(
                    (m) => m.Resume
                  ),
              },
              {
                path: 'skills',
                loadComponent: () =>
                  import('./pages/applicant/skills/skills').then(
                    (m) => m.Skills
                  ),
              },
              {
                path: 'applications',
                loadComponent: () =>
                  import('./pages/applicant/applications/applications').then(
                    (m) => m.Applications
                  ),
              },
              {
                path: 'saved-jobs',
                loadComponent: () =>
                  import('./pages/applicant/saved-jobs/saved-jobs').then(
                    (m) => m.SavedJobs
                  ),
              },
              {
                path: 'job-alerts',
                loadComponent: () =>
                  import('./pages/applicant/job-alerts/job-alerts').then(
                    (m) => m.JobAlerts
                  ),
              },
              {
                path: 'interviews',
                loadComponent: () =>
                  import('./pages/applicant/interviews/interviews').then(
                    (m) => m.Interviews
                  ),
              },
              {
                path: 'offers',
                loadComponent: () =>
                  import('./pages/applicant/offers/offers').then(
                    (m) => m.Offers
                  ),
              },
              {
                path: 'settings',
                loadComponent: () =>
                  import('./pages/applicant/settings/settings').then(
                    (m) => m.Settings
                  ),
              },
              {
                path: 'privacy',
                loadComponent: () =>
                  import('./pages/applicant/privacy/privacy').then(
                    (m) => m.Privacy
                  ),
              },
            ],
          },
        ],
      },

      // Employer routes
      {
        path: 'employer',
        canActivate: [AuthGuard, RoleGuard([Role.EMPLOYER])],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./shared/layouts/employer-layout/employer-layout').then(
                (m) => m.EmployerLayout
              ),
            children: [
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./pages/employer/dashboard/dashboard').then(
                    (m) => m.Dashboard
                  ),
              },
              {
                path: 'profile',
                loadComponent: () =>
                  import('./pages/employer/profile/profile').then(
                    (m) => m.Profile
                  ),
              },
              {
                path: 'team',
                loadComponent: () =>
                  import('./pages/employer/team/team').then(
                    (m) => m.Team
                  ),
              },
              {
                path: 'post-job',
                loadComponent: () =>
                  import('./pages/employer/post-job/post-job').then(
                    (m) => m.PostJob
                  ),
              },
              // Job Management Routes
              {
                path: 'jobs',
                children: [
                  {
                    path: 'active',
                    loadComponent: () =>
                      import('./pages/employer/jobs/active-jobs/active-jobs').then(
                        (m) => m.ActiveJobs
                      ),
                  },
                  {
                    path: 'drafts',
                    loadComponent: () =>
                      import('./pages/employer/jobs/draft-jobs/draft-jobs').then(
                        (m) => m.DraftJobs
                      ),
                  },
                  {
                    path: 'closed',
                    loadComponent: () =>
                      import('./pages/employer/jobs/closed-jobs/closed-jobs').then(
                        (m) => m.ClosedJobs
                      ),
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () =>
                      import('./pages/employer/jobs/edit-job/edit-job').then(
                        (m) => m.EditJob
                      ),
                  },
                ],
              },
              {
                path: 'applications',
                loadComponent: () =>
                  import('./pages/employer/applications/applications').then(
                    (m) => m.Applications
                  ),
              },
              {
                path: 'shortlisted',
                loadComponent: () =>
                  import('./pages/employer/shortlisted/shortlisted').then(
                    (m) => m.Shortlisted
                  ),
              },
              {
                path: 'interviews',
                loadComponent: () =>
                  import('./pages/employer/interviews/interviews').then(
                    (m) => m.Interviews
                  ),
              },
              {
                path: 'talent-pool',
                loadComponent: () =>
                  import('./pages/employer/talent-pool/talent-pool').then(
                    (m) => m.TalentPool
                  ),
              },
              {
                path: 'analytics',
                loadComponent: () =>
                  import('./pages/employer/analytics/analytics').then(
                    (m) => m.Analytics
                  ),
              },
              {
                path: 'reports',
                loadComponent: () =>
                  import('./pages/employer/reports/reports').then(
                    (m) => m.Reports
                  ),
              },
              {
                path: 'settings',
                loadComponent: () =>
                  import('./pages/employer/settings/settings').then(
                    (m) => m.Settings
                  ),
              },
              {
                path: 'billing',
                loadComponent: () =>
                  import('./pages/employer/billing/billing').then(
                    (m) => m.Billing
                  ),
              },
            ],
          },
        ],
      },
    ],
  },

  // Wildcard route
  { path: '**', redirectTo: '' },
];