// src/app/core/services/applicant-profiles.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicantProfile, ApplicantSkill } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicantProfilesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applicant-profiles`;

  /**
   * Create applicant profile
   */
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Get my profile
   */
  getMyProfile(): Observable<{ profile: ApplicantProfile }> {
    return this.http.get<{ profile: ApplicantProfile }>(`${this.apiUrl}/me`);
  }

  /**
   * Update my profile
   */
  updateMyProfile(data: Partial<ApplicantProfile>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }

  /**
   * Complete profile (wizard)
   */
  completeProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/complete`, data);
  }

  /**
   * Add skill
   */
  addSkill(data: {
    skillName: string;
    proficiencyLevel?: string;
    yearsOfExperience?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/me/skills`, data);
  }

  /**
   * Get my skills
   */
  getMySkills(): Observable<{ skills: ApplicantSkill[] }> {
    return this.http.get<{ skills: ApplicantSkill[] }>(
      `${this.apiUrl}/me/skills`
    );
  }

  /**
   * Remove skill
   */
  removeSkill(skillId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me/skills/${skillId}`);
  }

  /**
   * Update resume
   */
  updateResume(resumeUrl: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/resume`, { resumeUrl });
  }

  /**
   * Update profile image
   */
  updateProfileImage(imageUrl: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/profile-image`, { imageUrl });
  }

  /**
   * Get profile by ID (public)
   */
  getProfileById(id: string): Observable<{ profile: ApplicantProfile }> {
    return this.http.get<{ profile: ApplicantProfile }>(
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