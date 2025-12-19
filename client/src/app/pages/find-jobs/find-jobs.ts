import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Search } from 'lucide-angular';
import { JobListing } from '../../shared/components/job-listing/job-listing';
import { JobsService } from '../../core/services/jobs.service';
import { Job, SearchJobsParams } from '../../core/models/job.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-find-jobs',
  imports: [CommonModule, FormsModule, LucideAngularModule, JobListing, RouterModule],
  templateUrl: './find-jobs.html',
  styleUrl: './find-jobs.css',
})
export class FindJobs implements OnInit {
  searchQuery: string = '';
  location: string = '';
  readonly Search = Search;
  readonly MapPin = MapPin;
  private jobService = inject(JobsService);
  private destroyRef = inject(DestroyRef);
  jobsService = inject(JobsService);
  selectedLocation = '';
  selectedType = '';

  ngOnInit(): void {
    this.loadJobs();
  }
  loadJobs(): void {
    const params: SearchJobsParams = {
      query: this.searchQuery || undefined,
      location: this.selectedLocation || undefined,
      employmentType: this.selectedType || undefined,
      // limit: 10,
    };

    // Smart caching - will use cache if available
    this.jobsService
      .getAll(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ jobs, count }) => {
          console.log(`Loaded ${jobs.length} jobs`);
        },
        error: (error) => {
          console.error('Error loading jobs:', error);
        },
      });
  }

  // onSearch(): void {
  //   if (!this.searchQuery.trim() && !this.location.trim()) {
  //     return;
  //   }

  //   console.log('Searching for:', {
  //     query: this.searchQuery,
  //     location: this.location,
  //   });

  //   // Implement your search logic here
  //   // For example: this.router.navigate(['/jobs'], { queryParams: { q: this.searchQuery, l: this.location } });
  // }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearch(): void {
    // Search will clear cache and fetch fresh
    const params: SearchJobsParams = {
      query: this.searchQuery || undefined,
      location: this.selectedLocation || undefined,
      employmentType: this.selectedType || undefined,
    };

    this.jobsService.search(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  refreshJobs(): void {
    const params: SearchJobsParams = {
      query: this.searchQuery || undefined,
      location: this.selectedLocation || undefined,
      employmentType: this.selectedType || undefined,
    };

    this.jobsService.refresh(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
