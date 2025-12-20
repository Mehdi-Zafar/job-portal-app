import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  public loading = signal(false);
  public emailSent = signal(false);
  public errorMessage = signal<string | null>(null);

  public forgotPasswordForm: FormGroup = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.emailSent.set(true);
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to send reset email');
      },
    });
  }
}
