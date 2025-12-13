// src/app/core/services/employer-profiles.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployerProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class EmployerProfilesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employer-profiles`;

  /**
   * Create employer profile
   */
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Get my profile
   */
  getMyProfile(): Observable<{ profile: EmployerProfile }> {
    return this.http.get<{ profile: EmployerProfile }>(`${this.apiUrl}/me`);
  }

  /**
   * Update my profile
   */
  updateMyProfile(data: Partial<EmployerProfile>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }

  /**
   * Complete profile (wizard)
   */
  completeProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/complete`, data);
  }

  /**
   * Update company logo
   */
  updateLogo(logoUrl: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/logo`, { logoUrl });
  }

  /**
   * Get all verified employers
   */
  getAllVerified(limit: number = 20, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.apiUrl}`, { params });
  }

  /**
   * Search employer profiles
   */
  search(query: string): Observable<any> {
    let params = new HttpParams().set('q', query);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get profile by ID (public)
   */
  getProfileById(id: string): Observable<{ profile: EmployerProfile }> {
    return this.http.get<{ profile: EmployerProfile }>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Delete my profile
   */
  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me`);
  }
}