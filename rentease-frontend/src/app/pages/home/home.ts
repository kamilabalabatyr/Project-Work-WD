import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { IProperty } from '../../interfaces/property.interface';
import { getPropertyImageUrl } from '../../utils/property-image.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  properties = signal<IProperty[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.propertyService.getAll().subscribe({
      next: (res) => {
        this.properties.set(res.results.slice(0, 3));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объекты');
        this.isLoading.set(false);
      }
    });
  }

  getImage(property: IProperty): string {
    return getPropertyImageUrl(property.id, 400, 260);
  }
}
