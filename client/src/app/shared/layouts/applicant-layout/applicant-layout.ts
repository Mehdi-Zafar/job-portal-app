import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { MenuSection, SidebarLayout } from '../sidebar-layout/sidebar-layout';

@Component({
  selector: 'app-applicant-layout',
  imports: [SidebarLayout],
  templateUrl: './applicant-layout.html',
  styleUrl: './applicant-layout.css',
})
export class ApplicantLayout {
  private authService = inject(AuthService);
  private applicationsService = inject(ApplicationsService);

  // Dynamic title based on user
  title = computed(() => {
    const user = this.authService.currentUser();
    return user?.username ? `Welcome, ${user.username}!` : 'Applicant Portal';
  });

  subtitle = computed(() => {
    const profile = this.authService.applicantProfile();
    return  'Job Seeker';
  });

  // Menu items with dynamic badges
  menuItems: MenuSection[] = [
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard', icon: '📊', route: '/applicant/dashboard' },
      ],
    },
    {
      section: 'Profile',
      items: [
        { label: 'My Profile', icon: '👤', route: '/applicant/profile' },
        { label: 'Resume', icon: '📄', route: '/applicant/resume' },
        { label: 'Skills', icon: '⚡', route: '/applicant/skills' },
      ],
    },
    {
      section: 'Job Search',
      items: [
        { label: 'Find Jobs', icon: '🔍', route: '/applicant/find-jobs' },
        { label: 'Saved Jobs', icon: '💾', route: '/applicant/saved-jobs' },
        { label: 'Job Alerts', icon: '🔔', route: '/applicant/job-alerts' },
      ],
    },
    {
      section: 'Applications',
      items: [
        { label: 'My Applications', icon: '📝', route: '/applicant/applications' },
        { label: 'Interviews', icon: '🎤', route: '/applicant/interviews' },
        { label: 'Offers', icon: '🎁', route: '/applicant/offers' },
      ],
    },
    {
      section: 'Account',
      items: [
        { label: 'Settings', icon: '⚙️', route: '/applicant/settings' },
        { label: 'Privacy', icon: '🔒', route: '/applicant/privacy' },
      ],
    },
  ];
}
