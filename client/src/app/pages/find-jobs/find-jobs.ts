import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Search } from 'lucide-angular';
import { JobListing } from '../../shared/components/job-listing/job-listing';
import { JobsService } from '../../core/services/jobs.service';
import { Job } from '../../core/models/job.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-find-jobs',
  imports: [CommonModule, FormsModule, LucideAngularModule, JobListing],
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

  jobs = signal<Job[]>([]);

  ngOnInit(): void {
    // Initial load of jobs can be done here

    this.jobService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ jobs, count }) => {
        this.jobs.set(jobs);
      },
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim() && !this.location.trim()) {
      return;
    }

    console.log('Searching for:', {
      query: this.searchQuery,
      location: this.location,
    });

    // Implement your search logic here
    // For example: this.router.navigate(['/jobs'], { queryParams: { q: this.searchQuery, l: this.location } });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
