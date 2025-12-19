// src/app/core/services/jobs.service.ts
import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, CreateJobRequest, SearchJobsParams } from '../models/job.model';

interface JobsCache {
  jobs: Job[];
  totalCount: number;
  lastFetch: number;
  params: SearchJobsParams;
}

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jobs`;

  // Cache duration in milliseconds (5 minutes)
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  // State signals
  private jobsSignal = signal<Job[]>([]);
  private totalCountSignal = signal<number>(0);
  private myJobsSignal = signal<Job[]>([]);
  private currentJobSignal = signal<Job | null>(null);
  private loadingSignal = signal<boolean>(false);
  private statisticsSignal = signal<any>(null);
  private currentParamsSignal = signal<SearchJobsParams>({});
  private lastFetchSignal = signal<number>(0);
  private hasMoreSignal = signal<boolean>(true);

  // Public readonly signals
  readonly jobs = this.jobsSignal.asReadonly();
  readonly totalCount = this.totalCountSignal.asReadonly();
  readonly myJobs = this.myJobsSignal.asReadonly();
  readonly currentJob = this.currentJobSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly statistics = this.statisticsSignal.asReadonly();
  readonly currentParams = this.currentParamsSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();

  // Computed signals
  readonly jobsCount = computed(() => this.jobs().length);
  readonly myJobsCount = computed(() => this.myJobs().length);
  readonly activeJobs = computed(() => 
    this.jobs().filter(job => job.status === 'ACTIVE')
  );
  readonly draftJobs = computed(() => 
    this.myJobs().filter(job => job.status === 'DRAFT')
  );

  /**
   * Get all jobs with smart caching
   * - Returns cached data if fresh
   * - Fetches new data if cache expired or params changed
   */
  getAll(searchParams: SearchJobsParams = {}, forceRefresh = false): Observable<{ jobs: Job[]; count: number }> {
    const currentTime = Date.now();
    const lastFetch = this.lastFetchSignal();
    const currentParams = this.currentParamsSignal();
    
    // Check if we should use cache
    const isCacheFresh = (currentTime - lastFetch) < this.CACHE_DURATION;
    const paramsUnchanged = this.areParamsEqual(currentParams, searchParams);
    const hasNoOffset = !searchParams.offset || searchParams.offset === 0;

    // Return cached data if:
    // 1. Cache is fresh
    // 2. Params haven't changed
    // 3. Not requesting offset data (first page only)
    // 4. Not forcing refresh
    if (isCacheFresh && paramsUnchanged && hasNoOffset && !forceRefresh && this.jobs().length > 0) {
      console.log('📦 Using cached jobs');
      return of({ 
        jobs: this.jobs(), 
        count: this.totalCountSignal() 
      });
    }

    // Fetch fresh data
    console.log('🌐 Fetching fresh jobs from API');
    return this.fetchJobs(searchParams);
  }

  /**
   * Load more jobs (for infinite scroll)
   * Appends to existing jobs
   */
  loadMore(searchParams: SearchJobsParams = {}): Observable<{ jobs: Job[]; count: number }> {
    const currentJobs = this.jobs();
    const currentParams = this.currentParamsSignal();

    // Calculate next offset
    const offset = currentJobs.length;
    const params = { ...searchParams, offset };

    this.loadingSignal.set(true);

    return this.fetchJobs(params, false).pipe(
      tap(({ jobs, count }) => {
        // Append new jobs to existing ones
        const updatedJobs = [...currentJobs, ...jobs];
        this.jobsSignal.set(updatedJobs);
        this.totalCountSignal.set(count);
        
        // Check if there are more jobs to load
        this.hasMoreSignal.set(updatedJobs.length < count);
        
        this.loadingSignal.set(false);
        console.log(`📊 Loaded ${jobs.length} more jobs. Total: ${updatedJobs.length}/${count}`);
      })
    );
  }

  /**
   * Paginate jobs (for traditional pagination)
   * Replaces existing jobs with new page
   */
  paginate(page: number, limit: number = 20, searchParams: SearchJobsParams = {}): Observable<{ jobs: Job[]; count: number }> {
    const offset = (page - 1) * limit;
    const params = { ...searchParams, offset, limit };
    
    return this.getAll(params, true); // Force refresh for new page
  }

  /**
   * Refresh jobs (force fetch)
   */
  refresh(searchParams: SearchJobsParams = {}): Observable<{ jobs: Job[]; count: number }> {
    return this.getAll(searchParams, true);
  }

  /**
   * Search jobs with new params
   * Clears existing jobs and fetches fresh
   */
  search(searchParams: SearchJobsParams): Observable<{ jobs: Job[]; count: number }> {
    this.clearJobs();
    return this.getAll(searchParams, true);
  }

  /**
   * Clear jobs cache
   */
  clearJobs(): void {
    this.jobsSignal.set([]);
    this.totalCountSignal.set(0);
    this.lastFetchSignal.set(0);
    this.hasMoreSignal.set(true);
  }

  /**
   * Internal method to fetch jobs from API
   */
  private fetchJobs(searchParams: SearchJobsParams, replaceJobs = true): Observable<{ jobs: Job[]; count: number }> {
    this.loadingSignal.set(true);

    let params = new HttpParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<{ jobs: Job[]; count: number }>(this.apiUrl, { params }).pipe(
      tap(({ jobs, count }) => {
        if (replaceJobs) {
          this.jobsSignal.set(jobs);
          this.totalCountSignal.set(count);
          this.hasMoreSignal.set(jobs.length < count);
        }
        
        this.currentParamsSignal.set(searchParams);
        this.lastFetchSignal.set(Date.now());
        this.loadingSignal.set(false);
        
        console.log(`✅ Fetched ${jobs.length} jobs out of ${count} total`);
      })
    );
  }

  /**
   * Compare search params
   */
  private areParamsEqual(params1: SearchJobsParams, params2: SearchJobsParams): boolean {
    const keys1 = Object.keys(params1).sort();
    const keys2 = Object.keys(params2).sort();

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => {
      const val1 = params1[key as keyof SearchJobsParams];
      const val2 = params2[key as keyof SearchJobsParams];
      return val1 === val2;
    });
  }

  /**
   * Create job posting
   */
  create(data: CreateJobRequest): Observable<any> {
    this.loadingSignal.set(true);

    return this.http.post(this.apiUrl, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
        // Clear cache so next fetch gets fresh data
        this.clearJobs();
      })
    );
  }

  /**
   * Get my jobs (employer only)
   */
  getMyJobs(): Observable<{ jobs: Job[]; count: number }> {
    this.loadingSignal.set(true);

    return this.http.get<{ jobs: Job[]; count: number }>(`${this.apiUrl}/my-jobs`).pipe(
      tap((response) => {
        this.myJobsSignal.set(response.jobs);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Get employer statistics
   */
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-jobs/statistics`).pipe(
      tap((stats) => {
        this.statisticsSignal.set(stats);
      })
    );
  }

  /**
   * Get job by ID
   */
  getById(id: string): Observable<{ job: Job }> {
    this.loadingSignal.set(true);

    return this.http.get<{ job: Job }>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        this.currentJobSignal.set(response.job);
        this.loadingSignal.set(false);
      })
    );
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
    return this.http.patch(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        // Clear cache to get fresh data
        this.clearJobs();
      })
    );
  }

  /**
   * Update job status
   */
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(() => {
        this.clearJobs();
      })
    );
  }

  /**
   * Duplicate job
   */
  duplicate(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap(() => {
        this.clearJobs();
      })
    );
  }

  /**
   * Delete job
   */
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.clearJobs();
      })
    );
  }

  /**
   * Clear current job
   */
  clearCurrentJob(): void {
    this.currentJobSignal.set(null);
  }
}