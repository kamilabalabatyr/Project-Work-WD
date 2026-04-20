import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { forkJoin } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { PropertyService } from '../../services/property.service';
import { IBooking } from '../../interfaces/booking.interface';
import { IProperty, getPropertyPhotoUrl } from '../../interfaces/property.interface';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterModule, NgTemplateOutlet, ConfirmModal],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss'
})
export class MyBookings implements OnInit {
  bookings = signal<IBooking[]>([]);
  propertiesMap = signal<Map<number, IProperty>>(new Map());
  isLoading = signal(true);
  errorMsg = signal('');
  cancellingIds = signal<Set<number>>(new Set());
  confirmCancelId = signal<number | null>(null);

  upcoming = computed(() => this.bookings().filter(b => b.booking_status === 'upcoming'));
  current  = computed(() => this.bookings().filter(b => b.booking_status === 'current'));
  completed = computed(() => this.bookings().filter(b => b.booking_status === 'completed'));

  constructor(
    private bookingService: BookingService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    forkJoin({
      bookings: this.bookingService.getMyBookings(),
      properties: this.propertyService.getAll()
    }).subscribe({
      next: ({ bookings, properties }) => {
        this.bookings.set(bookings);
        const map = new Map<number, IProperty>();
        properties.results.forEach(p => map.set(p.id, p));
        this.propertiesMap.set(map);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить бронирования');
        this.isLoading.set(false);
      }
    });
  }

  getProperty(id: number): IProperty | undefined {
    return this.propertiesMap().get(id);
  }

  getPropertyImage(id: number): string {
    const prop = this.propertiesMap().get(id);
    return getPropertyPhotoUrl(prop?.images?.[0] ?? 'photo_0.jpg');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  nightsCount(checkIn: string, checkOut: string): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  cancelBooking(id: number): void {
    this.confirmCancelId.set(id);
  }

  confirmCancel(): void {
    const id = this.confirmCancelId();
    if (id === null) return;
    this.confirmCancelId.set(null);
    this.cancellingIds.update(s => new Set(s).add(id));
    this.bookingService.cancel(id).subscribe({
      next: () => {
        this.bookings.update(list => list.filter(b => b.id !== id));
        this.cancellingIds.update(s => { const ns = new Set(s); ns.delete(id); return ns; });
      },
      error: () => {
        this.cancellingIds.update(s => { const ns = new Set(s); ns.delete(id); return ns; });
      }
    });
  }

  dismissCancel(): void {
    this.confirmCancelId.set(null);
  }
}
