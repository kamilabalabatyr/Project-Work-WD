import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  properties: IProperty[] = [];
  isLoading = true;
  errorMsg = '';

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Не удалось загрузить объекты';
        this.isLoading = false;
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