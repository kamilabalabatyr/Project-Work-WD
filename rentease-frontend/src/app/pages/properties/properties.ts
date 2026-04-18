import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { IProperty } from '../../interfaces/property.interface';
import { getPropertyImageUrl } from '../../utils/property-image.utils';

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

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading.set(true);
    this.propertyService.getAll().subscribe({
      next: (res) => {
        this.properties.set(res.results);
        this.filteredProperties.set(res.results);
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

  getImage(property: IProperty): string {
    return getPropertyImageUrl(property.id, 400, 260);
  }
}
