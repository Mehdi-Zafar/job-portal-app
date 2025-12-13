import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, JsonPipe, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  public signInForm = this.formBuilder.group({
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    password: this.formBuilder.control('', { validators: [Validators.required] }),
  });

  get email() {
    return this.signInForm.get('email');
  }

  get password() {
    return this.signInForm.get('password');
  }

  public onFormSubmit() {
    this.signInForm.markAllAsTouched();
    if (this.signInForm.invalid) return;
    this.authService
      .login(
        this.signInForm.value.email!,
        this.signInForm.value.password!
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Login successful', res);
          this.signInForm.reset();
        },
        error: (err) => {
          console.error('Login failed', err);
        },
      });

  }
}
