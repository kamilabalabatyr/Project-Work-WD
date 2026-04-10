import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './properties.html',
  styleUrl: './properties.scss'
})
export class Properties implements OnInit {
  properties = signal<IProperty[]>([]);
  filteredProperties = signal<IProperty[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  filterCity = signal('');
  filterMaxPrice = signal<number | null>(null);

  showAddForm = signal(false);
  newProperty = signal({
    title: '',
    description: '',
    city: '',
    price_per_night: undefined as number | undefined,
    max_guests: undefined as number | undefined,
  });

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading.set(true);
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.filteredProperties.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объекты');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.filteredProperties.set(this.properties().filter(p => {
      const matchCity = this.filterCity()
        ? p.city.toLowerCase().includes(this.filterCity().toLowerCase())
        : true;
      const matchPrice = this.filterMaxPrice()
        ? p.price_per_night <= this.filterMaxPrice()!
        : true;
      return matchCity && matchPrice;
    }));
  }

  clearFilters(): void {
    this.filterCity.set('');
    this.filterMaxPrice.set(null);
    this.filteredProperties.set([...this.properties()]);
  }

  onAddProperty(): void {
    const p = this.newProperty();
    if (!p.title || !p.description || !p.city || !p.price_per_night || !p.max_guests) return;

    this.propertyService.create(p).subscribe({
      next: (created) => {
        this.properties.update(list => [created, ...list]);
        this.filteredProperties.update(list => [created, ...list]);
        this.showAddForm.set(false);
        this.newProperty.set({ title: '', description: '', city: '', price_per_night: undefined, max_guests: undefined });
      },
      error: () => {
        this.errorMsg.set('Не удалось создать объявление');
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getGradient(property: IProperty): string {
    const colors = [
      'linear-gradient(135deg, #FF385C, #ff6b35)',
      'linear-gradient(135deg, #6C63FF, #3ecfcf)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
    ];
    return colors[property.id % colors.length];
  }
}
