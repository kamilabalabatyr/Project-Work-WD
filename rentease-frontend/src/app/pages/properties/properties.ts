import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './properties.html',
  styleUrl: './properties.scss'
})
export class Properties implements OnInit {
  properties: IProperty[] = [];
  filteredProperties: IProperty[] = [];
  isLoading = true;
  errorMsg = '';

  filterCity = '';
  filterMaxPrice: number | null = null;

  showAddForm = false;
  newProperty = {
    title: '',
    price_per_night: undefined as number | undefined,
    city: ''
};

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  // API уvent #1: loading the events
  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data;
        this.filteredProperties = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Не удалось загрузить объекты';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter(p => {
      const matchCity = this.filterCity
        ? p.city.toLowerCase().includes(this.filterCity.toLowerCase())
        : true;
      const matchPrice = this.filterMaxPrice
        ? p.price_per_night <= this.filterMaxPrice
        : true;
      return matchCity && matchPrice;
    });
  }

  clearFilters(): void {
    this.filterCity = '';
    this.filterMaxPrice = null;
    this.filteredProperties = [...this.properties];
  }

  // API event #2: creating the add
  onAddProperty(): void {
    if (!this.newProperty.title || !this.newProperty.city || !this.newProperty.price_per_night) {
      return;
    }

    this.propertyService.create(this.newProperty).subscribe({
      next: (created) => {
        this.properties.unshift(created);
        this.filteredProperties.unshift(created);
        this.showAddForm = false;
        this.newProperty = { title: '', price_per_night: undefined, city: '' };
      },
      error: () => {
        this.errorMsg = 'Не удалось создать объявление';
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getImage(property: IProperty): string {
    return `https://picsum.photos/seed/${property.id}/400/260`;
  }
}