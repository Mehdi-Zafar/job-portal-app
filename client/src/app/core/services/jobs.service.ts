// src/app/core/services/jobs.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, CreateJobRequest, SearchJobsParams } from '../models/job.model';

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jobs`;

  /**
   * Create job posting
   */
  create(data: CreateJobRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Get all jobs with filters
   */
  getAll(searchParams: SearchJobsParams = {}): Observable<{ jobs: Job[]; count: number }> {
    let params = new HttpParams();

    if (searchParams.query) {
      params = params.set('query', searchParams.query);
    }
    if (searchParams.location) {
      params = params.set('location', searchParams.location);
    }
    if (searchParams.employmentType) {
      params = params.set('employmentType', searchParams.employmentType);
    }
    if (searchParams.workplaceType) {
      params = params.set('workplaceType', searchParams.workplaceType);
    }
    if (searchParams.department) {
      params = params.set('department', searchParams.department);
    }
    if (searchParams.experienceLevel) {
      params = params.set('experienceLevel', searchParams.experienceLevel);
    }
    if (searchParams.salaryMin) {
      params = params.set('salaryMin', searchParams.salaryMin.toString());
    }
    if (searchParams.salaryMax) {
      params = params.set('salaryMax', searchParams.salaryMax.toString());
    }
    if (searchParams.skills) {
      params = params.set('skills', searchParams.skills);
    }
    if (searchParams.limit) {
      params = params.set('limit', searchParams.limit.toString());
    }
    if (searchParams.offset) {
      params = params.set('offset', searchParams.offset.toString());
    }

    return this.http.get<{ jobs: Job[]; count: number }>(this.apiUrl, { params });
  }

  /**
   * Search jobs
   */
  search(searchParams: SearchJobsParams): Observable<{ jobs: Job[]; count: number }> {
    return this.getAll(searchParams);
  }

  /**
   * Get my jobs (employer only)
   */
  getMyJobs(): Observable<{ jobs: Job[]; count: number }> {
    return this.http.get<{ jobs: Job[]; count: number }>(`${this.apiUrl}/my-jobs`);
  }

  /**
   * Get employer statistics
   */
  getStatistics(): Observable<{
    totalJobs: number;
    activeJobs: number;
    draftJobs: number;
    closedJobs: number;
    totalViews: number;
    totalApplications: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/my-jobs/statistics`);
  }

  /**
   * Get job by ID
   */
  getById(id: string): Observable<{ job: Job }> {
    return this.http.get<{ job: Job }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get similar jobs
   */
  getSimilar(id: string, limit: number = 5): Observable<{ jobs: Job[]; count: number }> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ jobs: Job[]; count: number }>(
      `${this.apiUrl}/${id}/similar`,
      { params }
    );
  }

  /**
   * Update job
   */
  update(id: string, data: Partial<CreateJobRequest>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Update job status
   */
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Duplicate job
   */
  duplicate(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/duplicate`, {});
  }

  /**
   * Delete job
   */
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}