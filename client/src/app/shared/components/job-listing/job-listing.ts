import { Component, Input } from '@angular/core';
import { Bookmark, LucideAngularModule } from 'lucide-angular';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-listing',
  imports: [LucideAngularModule],
  templateUrl: './job-listing.html',
  styleUrl: './job-listing.css',
})
export class JobListing {
  readonly Bookmark = Bookmark;
  @Input() job: Job | null = null;
}
