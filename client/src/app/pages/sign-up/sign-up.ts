import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
  atLeastOneRoleValidator,
} from '../../shared/utils/helpers';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  public signUpForm = this.formBuilder.group(
    {
      username: this.formBuilder.control('', {
        validators: [Validators.required, Validators.minLength(5)],
      }),
      email: this.formBuilder.control('', {
        validators: [Validators.required, Validators.email],
      }),
      isApplicant: this.formBuilder.control(false),
      isEmployer: this.formBuilder.control(false),
      password: this.formBuilder.control('', {
        validators: [Validators.required, passwordStrengthValidator()],
      }),
      confirmPassword: this.formBuilder.control('', {
        validators: [Validators.required, passwordStrengthValidator()],
      }),
    },
    {
      validators: [passwordMatchValidator, atLeastOneRoleValidator],
    }
  );

  get username() {
    return this.signUpForm.get('username');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get isApplicant() {
    return this.signUpForm.get('isApplicant');
  }

  get isEmployer() {
    return this.signUpForm.get('isEmployer');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  public onFormSubmit() {
    this.signUpForm.markAllAsTouched();
    if (this.signUpForm.invalid) return;

    // Prepare data with roles array
    const formValue = this.signUpForm.value;
    const roles = [];
    if (formValue.isApplicant) roles.push('APPLICANT');
    if (formValue.isEmployer) roles.push('EMPLOYER');

    const signupData:RegisterRequest = {
      username: formValue.username!,
      email: formValue.email!,
      password: formValue.password!,
      roles: roles,
    };

    console.log(signupData);
    this.authService.register(signupData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.signUpForm.reset();
      },
      error: (error) => {
        console.error('Registration failed', error);
      },
    });
    // TODO: Call your API service here
  }
}
