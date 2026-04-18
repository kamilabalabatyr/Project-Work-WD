import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { IProperty, getPropertyPhotoUrl } from '../../interfaces/property.interface';

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
  filterGuests = signal<number>(1);
  filterMaxPrice = signal<number | null>(null);

  availableCities = computed(() =>
    [...new Set(this.properties().map(p => p.city).filter(Boolean))].sort()
  );

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading.set(true);
    this.propertyService.getAll().subscribe({
      next: (res) => {
        this.properties.set(res.results);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объекты');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    const city = this.filterCity();
    const guests = this.filterGuests();
    const maxPrice = this.filterMaxPrice();

    const filtered = this.properties().filter(p => {
      const matchCity = city ? p.city === city : true;
      const matchGuests = p.max_guests >= guests;
      const matchPrice = maxPrice ? p.price_per_night <= maxPrice : true;
      return matchCity && matchGuests && matchPrice;
    });

    // Sort: exact guest count match first, then ascending by max_guests
    filtered.sort((a, b) => {
      const aExact = a.max_guests === guests ? 0 : 1;
      const bExact = b.max_guests === guests ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return a.max_guests - b.max_guests;
    });

    this.filteredProperties.set(filtered);
  }

  clearFilters(): void {
    this.filterCity.set('');
    this.filterGuests.set(1);
    this.filterMaxPrice.set(null);
    this.filteredProperties.set([...this.properties()]);
  }

  getImage(property: IProperty): string {
    return getPropertyPhotoUrl(property.images?.[0] ?? 'photo_0.jpg');
  }
}
