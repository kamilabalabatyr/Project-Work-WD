import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isExtranet = false;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isExtranet = (e.urlAfterRedirects as string).startsWith('/extranet');
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isLandlord(): boolean {
    return this.authService.isLandlord();
  }

  getUsername(): string | null {
    return this.authService.getUsername();
  }

  logout(): void {
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
