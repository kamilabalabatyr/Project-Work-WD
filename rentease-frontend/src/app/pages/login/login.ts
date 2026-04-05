import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isLoginMode = true;
  isLoading = false;
  errorMsg = '';

  credentials = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: ''
  };

constructor(private authService: AuthService, private router: Router) {}

toggleMode() {
  this.isLoginMode = !this.isLoginMode;
  this.errorMsg = '';
}

onLogin() {
  this.isLoading = true;
  this.errorMsg = '';

  this.authService.login(this.credentials).subscribe({
    next: (res) => {
      this.authService.saveToken(res.token);
      this.isLoading = false;
      this.router.navigate(['/']);
    },
    error: (err) => {
      this.errorMsg = 'Неверный логин или пароль';
      this.isLoading = false;
    }
  });
}

onRegister() {
  this.isLoading = true;
  this.errorMsg = '';

  this.authService.register(this.registerData).subscribe({
    next: () => {
      this.isLoading = false;
      this.isLoginMode = true;
    },
    error: (err) => {
      this.errorMsg = 'Ошибка регистрации. Проверьте данные.';
      this.isLoading = false;
    }
  });
}
}