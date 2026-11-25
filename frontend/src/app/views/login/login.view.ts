import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface LoginPayload {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.view.html',
  styleUrl: './login.view.scss',
})
export class LoginView {
  readonly submitForm = output<LoginPayload>();
  readonly loading = model(false);
  readonly error = model<string | null>(null);

  email = '';
  password = '';
  showPassword = false;

  submit(): void {
    this.error.set(null);
    if (!this.email.trim() || !this.password) {
      this.error.set('Ingrese su correo y contraseña.');
      return;
    }
    this.submitForm.emit({ email: this.email.trim(), password: this.password });
  }
}
