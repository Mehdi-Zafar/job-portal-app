import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  public isLoading = this.authService.loading;
  public isApplicant = this.authService.isApplicant;
  public isEmployer = this.authService.isEmployer;
  public isEmployerProfileComplete = this.authService.isEmployerProfileComplete;
  public isApplicantProfileComplete = this.authService.isApplicantProfileComplete;
  public currentUser = this.authService.currentUser;
  public isAuthenticated = this.authService.isAuthenticated;

  public logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
