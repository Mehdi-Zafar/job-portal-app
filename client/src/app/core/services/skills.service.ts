// src/app/core/services/skills.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Skill } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/skills`;

  /**
   * Get all skills
   */
  getAll(limit: number = 100, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Search skills
   */
  search(query: string, limit: number = 20): Observable<{ skills: Skill[]; count: number }> {
    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<{ skills: Skill[]; count: number }>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * Get skill categories
   */
  getCategories(): Observable<{ categories: string[]; count: number }> {
    return this.http.get<{ categories: string[]; count: number }>(
      `${this.apiUrl}/categories`
    );
  }

  /**
   * Get skills grouped by category
   */
  getGrouped(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grouped`);
  }

  /**
   * Get skills by category
   */
  getByCategory(category: string, limit: number = 50): Observable<any> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/category/${category}`, { params });
  }

  /**
   * Get popular skills
   */
  getPopular(limit: number = 20): Observable<any> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/popular`, { params });
  }

  /**
   * Get statistics
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  /**
   * Get skill by ID
   */
  getById(id: string): Observable<{ skill: Skill }> {
    return this.http.get<{ skill: Skill }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create skill
   */
  create(data: { name: string; category?: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}