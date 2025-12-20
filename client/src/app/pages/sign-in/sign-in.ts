import { JsonPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private toastr = inject(ToastrService);
  public isLoading = computed(()=>this.authService.loading());

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
      .login(this.signInForm.value.email!, this.signInForm.value.password!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Login successful', res);
          this.signInForm.reset();
          this.toastr.success('Logged in successfully!', 'Success');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastr.error(err.error.message, 'Error');
          console.error('Login failed', err);
        },
      });
  }
}
