import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { passwordMatchValidator, passwordStrengthValidator } from '../../shared/utils/helpers';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private formBuilder = inject(FormBuilder);

  public signUpForm = this.formBuilder.group({
    username: this.formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    password: this.formBuilder.control('', {
      validators: [Validators.required, passwordStrengthValidator()],
    }),
    confirmPassword: this.formBuilder.control('', {
      validators: [Validators.required, passwordStrengthValidator()],
    }),
  }, {
  validators: passwordMatchValidator
});

  get username() {
    return this.signUpForm.get('username');
  }

  get email() {
    return this.signUpForm.get('email');
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
    console.log(this.signUpForm.value);
  }
}
