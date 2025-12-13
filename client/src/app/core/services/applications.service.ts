// src/app/core/services/applications.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  /**
   * Apply to a job
   */
  create(data: CreateApplicationRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Get my applications (applicant)
   */
  getMyApplications(
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<{ applications: Application[]; count: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ applications: Application[]; count: number }>(
      `${this.apiUrl}/my-applications`,
      { params }
    );
  }

  /**
   * Get applicant statistics
   */
  getApplicantStatistics(): Observable<{
    totalApplications: number;
    submitted: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/my-applications/statistics`);
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
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (jobPostingId) {
      params = params.set('jobPostingId', jobPostingId);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ applications: Application[]; count: number }>(
      `${this.apiUrl}/employer/all`,
      { params }
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
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ applications: Application[]; count: number }>(
      `${this.apiUrl}/job/${jobId}`,
      { params }
    );
  }

  /**
   * Check if user has applied to a job
   */
  checkApplication(jobId: string): Observable<{ hasApplied: boolean }> {
    return this.http.get<{ hasApplied: boolean }>(
      `${this.apiUrl}/check/${jobId}`
    );
  }

  /**
   * Get application by ID
   */
  getById(id: string): Observable<{ application: Application }> {
    return this.http.get<{ application: Application }>(`${this.apiUrl}/${id}`);
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
  updateStatus(
    id: string,
    data: UpdateApplicationStatusRequest
  ): Observable<any> {
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
}