import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  verifying = signal(true);
  verified = signal(false);
  error = signal<string | null>(null);
  resending = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.verifying.set(false);
      this.error.set('Invalid verification link');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verified.set(true);
      },
      error: (error) => {
        this.verifying.set(false);
        this.error.set(error.error?.message || 'Verification failed. The link may have expired.');
      },
    });
  }

  resendVerification(): void {
    // In a real app, you'd need to get the email somehow
    // For now, redirect to login
    this.router.navigate(['/sign-in']);
  }
}
