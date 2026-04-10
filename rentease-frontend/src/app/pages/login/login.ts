import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isLoginMode = signal(true);
  isLoading = signal(false);
  errorMsg = signal('');
  fieldErrors = signal<Record<string, string[]>>({});

  credentials = signal({ username: '', password: '' });
  registerData = signal({ username: '', email: '', password: '', password2: '' });

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.errorMsg.set('');
    this.fieldErrors.set({});
  }

  onLogin() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.fieldErrors.set({});

    this.authService.login(this.credentials()).subscribe({
      next: (res: { token: string }) => {
        this.authService.saveToken(res.token);
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        const errors = this.parseErrors(err);
        this.fieldErrors.set(errors);
        this.errorMsg.set(errors['non_field_errors']?.[0] ?? 'Неверный логин или пароль');
        this.isLoading.set(false);
      }
    });
  }

  onRegister() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.fieldErrors.set({});

    this.authService.register(this.registerData()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isLoginMode.set(true);
      },
      error: (err) => {
        const errors = this.parseErrors(err);
        this.fieldErrors.set(errors);
        this.errorMsg.set(errors['non_field_errors']?.[0] ?? '');
        this.isLoading.set(false);
      }
    });
  }

  private parseErrors(err: any): Record<string, string[]> {
    if (err?.error && typeof err.error === 'object') return err.error;
    return {};
  }

  getFieldError(field: string): string {
    return this.fieldErrors()[field]?.[0] ?? '';
  }
}
