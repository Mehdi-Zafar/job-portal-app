import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, JsonPipe, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private formBuilder = inject(FormBuilder);

  public signInForm = this.formBuilder.group({
    email: this.formBuilder.control('', { validators: [Validators.required, Validators.email] }),
    password: this.formBuilder.control('', { validators: [Validators.required] }),
  });

  get email(){
    return this.signInForm.get("email")
  }

  get password(){
    return this.signInForm.get("password")
  }

  public onFormSubmit() {
    this.signInForm.markAllAsTouched();
    if (this.signInForm.invalid) return;
    console.log(this.signInForm.value);
  }
}
