import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { JobsService } from '../../../core/services/jobs.service';
import { MenuSection, SidebarLayout } from '../sidebar-layout/sidebar-layout';

@Component({
  selector: 'app-employer-layout',
  imports: [SidebarLayout],
  templateUrl: './employer-layout.html',
  styleUrl: './employer-layout.css',
})
export class EmployerLayout {
  private authService = inject(AuthService);
  private jobsService = inject(JobsService);

  title = computed(() => {
    const profile = this.authService.employerProfile();
    return  'Employer Portal';
  });

  subtitle = computed(() => {
    const profile = this.authService.employerProfile();
    return  'Hiring Manager';
  });

  // Menu with dynamic counts
  menuItems = computed(() => {
    const stats = this.jobsService.statistics();
    
    return [
      {
        section: 'Overview',
        items: [
          { label: 'Dashboard', icon: '📊', route: '/employer/dashboard' },
        ],
      },
      {
        section: 'Company',
        items: [
          { label: 'Company Profile', icon: '🏢', route: '/employer/profile' },
          { label: 'Team', icon: '👥', route: '/employer/team' },
        ],
      },
      {
        section: 'Job Management',
        items: [
          { label: 'Post a Job', icon: '➕', route: '/employer/post-job' },
          { 
            label: 'Active Jobs', 
            icon: '📢', 
            route: '/employer/jobs/active',
            badge: stats?.activeJobs?.toString() 
          },
          { 
            label: 'Draft Jobs', 
            icon: '📝', 
            route: '/employer/jobs/drafts',
            badge: stats?.draftJobs?.toString()
          },
          { label: 'Closed Jobs', icon: '🔒', route: '/employer/jobs/closed' },
        ],
      },
      {
        section: 'Candidates',
        items: [
          { label: 'All Applications', icon: '📥', route: '/employer/applications' },
          { label: 'Shortlisted', icon: '⭐', route: '/employer/shortlisted' },
          { label: 'Interviews', icon: '🎤', route: '/employer/interviews' },
          { label: 'Talent Pool', icon: '💎', route: '/employer/talent-pool' },
        ],
      },
      {
        section: 'Analytics',
        items: [
          { label: 'Job Performance', icon: '📈', route: '/employer/analytics' },
          { label: 'Reports', icon: '📊', route: '/employer/reports' },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Settings', icon: '⚙️', route: '/employer/settings' },
          { label: 'Billing', icon: '💳', route: '/employer/billing' },
        ],
      },
    ] as MenuSection[];
  });

  ngOnInit() {
    // Load statistics for badge counts
    this.jobsService.getStatistics().subscribe();
  }
}
