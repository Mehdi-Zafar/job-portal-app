import { Component } from '@angular/core';
import { Bookmark, LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'app-job-listing',
  imports: [LucideAngularModule],
  templateUrl: './job-listing.html',
  styleUrl: './job-listing.css',
})
export class JobListing {
  readonly Bookmark = Bookmark
}
