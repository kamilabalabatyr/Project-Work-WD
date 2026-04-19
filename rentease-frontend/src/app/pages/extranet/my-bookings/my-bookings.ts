import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property.service';
import { IBooking } from '../../../interfaces/booking.interface';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss'
})
export class MyBookings implements OnInit {
  bookings = signal<IBooking[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  searchQuery = signal('');
  sortBy = signal<'date_desc' | 'date_asc' | 'price_desc'>('date_desc');

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let list = this.bookings().filter(b =>
      !q ||
      b.guest.toLowerCase().includes(q) ||
      (b.property_title ?? '').toLowerCase().includes(q) ||
      (b.property_city ?? '').toLowerCase().includes(q)
    );

    switch (this.sortBy()) {
      case 'date_asc':
        list = [...list].sort((a, b) => a.check_in.localeCompare(b.check_in));
        break;
      case 'price_desc':
        list = [...list].sort((a, b) => +b.total_price - +a.total_price);
        break;
      default:
        list = [...list].sort((a, b) => b.check_in.localeCompare(a.check_in));
    }
    return list;
  });

  totalRevenue = computed(() =>
    this.bookings().reduce((sum, b) => sum + +b.total_price, 0)
  );

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.propertyService.getAllLandlordBookings().subscribe({
      next: data => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить бронирования.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  nightsCount(booking: IBooking): number {
    const ms = new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime();
    return Math.round(ms / 86_400_000);
  }

  bookingStatus(booking: IBooking): 'upcoming' | 'current' | 'completed' {
    return booking.booking_status as 'upcoming' | 'current' | 'completed';
  }
}
