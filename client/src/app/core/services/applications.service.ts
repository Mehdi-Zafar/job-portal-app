// src/app/core/services/applications.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Application,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  ApplicationActivity,
} from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  // State signals
  private myApplicationsSignal = signal<Application[]>([]);
  private employerApplicationsSignal = signal<Application[]>([]);
  private currentApplicationSignal = signal<Application | null>(null);
  private statisticsSignal = signal<any>(null);
  private loadingSignal = signal<boolean>(false);

  // Public readonly signals
  readonly myApplications = this.myApplicationsSignal.asReadonly();
  readonly employerApplications = this.employerApplicationsSignal.asReadonly();
  readonly currentApplication = this.currentApplicationSignal.asReadonly();
  readonly statistics = this.statisticsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Computed signals
  readonly myApplicationsCount = computed(() => this.myApplications().length);
  readonly submittedApplications = computed(() =>
    this.myApplications().filter((app) => app.status === 'SUBMITTED')
  );
  readonly reviewedApplications = computed(() =>
    this.myApplications().filter((app) => app.status === 'REVIEWED')
  );
  readonly shortlistedApplications = computed(() =>
    this.myApplications().filter((app) => app.status === 'SHORTLISTED')
  );

  /**
   * Apply to a job
   */
  create(data: CreateApplicationRequest): Observable<any> {
    this.loadingSignal.set(true);

    return this.http.post(this.apiUrl, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Get my applications (applicant)
   */
  getMyApplications(
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<{ applications: Application[]; count: number }> {
    this.loadingSignal.set(true);

    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<{ applications: Application[]; count: number }>(`${this.apiUrl}/my-applications`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.myApplicationsSignal.set(response.applications);
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Get applicant statistics
   */
  getApplicantStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-applications/statistics`).pipe(
      tap((stats) => {
        this.statisticsSignal.set(stats);
      })
    );
  }

  /**
   * Get all applications for employer
   */
  getEmployerApplications(
    jobPostingId?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<{ applications: Application[]; count: number }> {
    this.loadingSignal.set(true);

    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    if (jobPostingId) {
      params = params.set('jobPostingId', jobPostingId);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<{ applications: Application[]; count: number }>(`${this.apiUrl}/employer/all`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.employerApplicationsSignal.set(response.applications);
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Get applications for a specific job (employer)
   */
  getJobApplications(
    jobId: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<{ applications: Application[]; count: number }> {
    this.loadingSignal.set(true);

    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<{ applications: Application[]; count: number }>(`${this.apiUrl}/job/${jobId}`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.loadingSignal.set(false);
        })
      );
  }

  /**
   * Check if user has applied to a job
   */
  checkApplication(jobId: string): Observable<{ hasApplied: boolean }> {
    return this.http.get<{ hasApplied: boolean }>(`${this.apiUrl}/check/${jobId}`);
  }

  /**
   * Get application by ID
   */
  getById(id: string): Observable<{ application: Application }> {
    this.loadingSignal.set(true);

    return this.http.get<{ application: Application }>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        this.currentApplicationSignal.set(response.application);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Get application activities
   */
  getActivities(id: string): Observable<{ activities: ApplicationActivity[]; count: number }> {
    return this.http.get<{ activities: ApplicationActivity[]; count: number }>(
      `${this.apiUrl}/${id}/activities`
    );
  }

  /**
   * Update application status (employer)
   */
  updateStatus(id: string, data: UpdateApplicationStatusRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, data);
  }

  /**
   * Add note to application (employer)
   */
  addNote(id: string, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/notes`, { notes });
  }

  /**
   * Withdraw application (applicant)
   */
  withdraw(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Clear current application
   */
  clearCurrentApplication(): void {
    this.currentApplicationSignal.set(null);
  }
}
