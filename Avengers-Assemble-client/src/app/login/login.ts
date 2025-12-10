import { Component, signal, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatAnchor } from "@angular/material/button";
import { PasswordValidator } from '../_helpers/password.validator';
import { PasswordMatchValidator } from '../_helpers/password-match.validator';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInput, MatLabel, MatAnchor],

  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  accountService = inject(AccountService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);


  mode: 'login' | 'register' = 'login'
  form: FormGroup


  errorMessage = {
    username: signal(''),
    password: signal(''),
    confirm_password: signal(''),
    display_name: signal('')
  }


  constructor() {
    this.form = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.maxLength(16),
        Validators.minLength(4)
      ]),

      password: new FormControl('', [
        Validators.required,
        PasswordValidator(8, 16)
      ])
    })
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.mode === 'login') {
      this.accountService.login(this.form.value).subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: error => {
          console.log(error);
          this.snackBar.open(error.error || 'Login failed', 'Close', { duration: 3000 });
        }
      })
    } else {
      // For register, we need to match the backend expectation.
      // Backend expects: username, password, display_name (maybe via Brawler model?)
      // Check the backend RegisterBrawlerModel: 
      // pub struct RegisterBrawlerModel { pub username: String, pub password: String, pub name: String }
      // The form has display_name, backend expects 'name'.

      const val = this.form.value;
      const registerModel = {
        username: val.username,
        password: val.password,
        display_name: val.display_name
      };

      this.accountService.register(registerModel).subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: error => {
          console.log(error);
          this.snackBar.open(error.error || 'Registration failed', 'Close', { duration: 3000 });
        }
      })
    }
  }


  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login'
    this.updateForm()
  }

  private updateForm(): void {
    if (this.mode === 'register') {
      this.form.addControl('confirm_password', new FormControl('', [Validators.required]))
      this.form.addControl('display_name', new FormControl('', [
        Validators.required,
        Validators.maxLength(16),
        Validators.minLength(4)
      ]))

      this.form.addValidators(PasswordMatchValidator('password', 'confirm_password'))
    } else {
      this.form.removeControl('confirm_password')
      this.form.removeControl('display_name')
    }

    this.form.removeValidators(PasswordMatchValidator('password', 'confirm_password'))
  }

  updateErrorMessage(ctrlName: string): void {
    const control = this.form.controls[ctrlName]
    if (!control) return
    switch (ctrlName) {
      case 'username':
        if (control.hasError('required')) this.errorMessage.username.set('required')
        else if (control.hasError('minlength')) {
          this.errorMessage.username.set('must be at least 4 characters long')
        }
        else if (control.hasError('maxlength')) {
          this.errorMessage.username.set('must be  16 characters or less')
        }
        else this.errorMessage.username.set('')

        break
      case 'password':
        if (control.hasError('required')) this.errorMessage.password.set('required')

        else if (control.hasError('invalidMinLength')) {
          this.errorMessage.password.set(`must be at least 8 characters long`)
        }
        else if (control.hasError('invalidMaxLength')) {
          this.errorMessage.password.set(`must be 16 characters or less`)
        }
        else if (control.hasError('invalidLowcase')) {
          this.errorMessage.password.set('must contain at least one lowercase letter')
        }
        else if (control.hasError('invalidUppercase')) {
          this.errorMessage.password.set('must contain at least one uppercase letter')
        }
        else if (control.hasError('invalidNumberic')) {
          this.errorMessage.password.set('must contain at least one number')
        }
        else if (control.hasError('invalidSpacialChar')) {
          this.errorMessage.password.set('must contain at least one special character: !@#$%^&*(),.?":{}|<>')
        }
        else this.errorMessage.password.set('')

        break
      case 'confirm_password':
        if (control.hasError('required')) this.errorMessage.confirm_password.set('required')

        else if (control.hasError('mismatch')) {
          this.errorMessage.confirm_password.set('passwords do not match')
        }
        else this.errorMessage.confirm_password.set('')
        break
      case 'display_name':
        if (control.hasError('required')) this.errorMessage.display_name.set('required')

        else if (control.hasError('minlength')) {
          this.errorMessage.display_name.set('must be at least 4 characters long')
        }
        else if (control.hasError('maxlength')) {
          this.errorMessage.display_name.set('must be  16 characters or less')
        }
        else this.errorMessage.display_name.set('')

        break
    }
  }
}
