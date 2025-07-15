import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  emailError = '';
  passwordError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    this.emailError = '';
    this.passwordError = '';

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        if (err.error === 'Correo no encontrado') {
          this.emailError = err.error;
          this.snackBar.open('Correo no encontrado. Verifica tu email.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        } else if (err.error === 'Contraseña incorrecta') {
          this.passwordError = err.error;
          this.snackBar.open('Contraseña incorrecta. Intenta de nuevo.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        } else {
          this.snackBar.open('Ocurrió un error inesperado.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      },
    });
    
  }
  hidePassword: boolean = true;

togglePasswordVisibility() {
  this.hidePassword = !this.hidePassword;
}

}
