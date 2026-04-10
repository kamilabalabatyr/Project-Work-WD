import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { IBooking } from '../../interfaces/booking.interface';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss'
})
export class MyBookings implements OnInit {
  bookings = signal<IBooking[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить бронирования');
        this.isLoading.set(false);
      }
    });
  }
}
