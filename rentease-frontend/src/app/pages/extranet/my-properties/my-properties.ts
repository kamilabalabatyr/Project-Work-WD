import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { IProperty } from '../../../interfaces/property.interface';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.scss',
})
export class MyProperties implements OnInit {
  properties = signal<IProperty[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  deletingId = signal<number | null>(null);

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить объявления');
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(property: IProperty) {
    if (!confirm(`Удалить объявление "${property.title}"?`)) return;
    this.deletingId.set(property.id);
    this.propertyService.delete(property.id).subscribe({
      next: () => {
        this.properties.update(list => list.filter(p => p.id !== property.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'На модерации',
      approved: 'Активно',
      rejected: 'Отклонено',
    };
    return map[status] ?? status;
  }
}
