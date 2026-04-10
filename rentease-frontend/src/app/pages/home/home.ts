import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  properties = signal<IProperty[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties.set(data.slice(0, 6));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объекты');
        this.isLoading.set(false);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.authService.clearToken(),
      error: () => this.authService.clearToken()
    });
  }

  getImage(property: IProperty): string {
    return `https://picsum.photos/seed/${property.id}/400/260`;
  }
}
