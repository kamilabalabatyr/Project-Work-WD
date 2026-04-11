import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.authService.clearToken(),
      error: () => this.authService.clearToken()
    });
  }
}
