import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Search } from 'lucide-angular';
import { JobListing } from "../../shared/components/job-listing/job-listing";

@Component({
  selector: 'app-find-jobs',
  imports: [CommonModule, FormsModule, LucideAngularModule, JobListing],
  templateUrl: './find-jobs.html',
  styleUrl: './find-jobs.css',
})
export class FindJobs {
  searchQuery: string = '';
  location: string = '';
  readonly Search = Search
  readonly MapPin = MapPin

  jobs=[1,2,3,4,5,6,7,8,9,10]

  onSearch(): void {
    if (!this.searchQuery.trim() && !this.location.trim()) {
      return;
    }

    console.log('Searching for:', {
      query: this.searchQuery,
      location: this.location
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
