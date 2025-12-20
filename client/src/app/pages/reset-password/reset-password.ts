import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { passwordMatchValidator, passwordStrengthValidator } from '../../shared/utils/helpers';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetPasswordForm: FormGroup;
  loading = signal(false);
  resetSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  private token = '';

  constructor() {
    this.resetPasswordForm = this.fb.group(
      {
        password: this.fb.control('', {
          validators: [Validators.required, passwordStrengthValidator()],
        }),
        confirmPassword: this.fb.control('', {
          validators: [Validators.required, passwordStrengthValidator()],
        }),
      },
      {
        validators: [passwordMatchValidator],
      }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage.set('Invalid reset link');
    }
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.resetSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/sign-in']);
        }, 2000);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to reset password');
      },
    });
  }
}
