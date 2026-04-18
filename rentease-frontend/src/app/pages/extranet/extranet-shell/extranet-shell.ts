import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-extranet-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './extranet-shell.html',
  styleUrl: './extranet-shell.scss',
})
export class ExtranetShell {
  constructor(private authService: AuthService, private router: Router) {}

  get username(): string {
    return this.authService.getUsername() ?? '';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearToken();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearToken();
        this.router.navigate(['/login']);
      }
    });
  }
}
