import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // don't validate empty — maybe handled by required

    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    const errors: ValidationErrors = {};
    if (!hasLetter) {
      errors['noLetter'] = true;
    }
    if (!hasNumber) {
      errors['noNumber'] = true;
    }
    if (!hasSpecial) {
      errors['noSpecialChar'] = true;
    }
    if (!hasMinLength) {
      errors['minLength'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

export const passwordMatchValidator: ValidatorFn = (
  formGroup: AbstractControl
): ValidationErrors | null => {
  const password = formGroup.get('password')?.value;
  const confirm = formGroup.get('confirmPassword')?.value;
  debugger;
  if (password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
};
