import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { IBooking } from '../../../interfaces/booking.interface';
import { IProperty } from '../../../interfaces/property.interface';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isCurrent: boolean;
  isToday: boolean;
  booking: IBooking | null;
}

@Component({
  selector: 'app-property-calendar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './property-calendar.html',
  styleUrl: './property-calendar.scss',
})
export class PropertyCalendar implements OnInit {
  property = signal<IProperty | null>(null);
  bookings = signal<IBooking[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  currentDate = signal(new Date());

  calendarDays = computed(() => this.buildCalendar(this.currentDate(), this.bookings()));

  monthNames = [
    'Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
  ];
  weekDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getById(id).subscribe({
      next: (p) => this.property.set(p),
    });
    this.propertyService.getPropertyBookings(id).subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Не удалось загрузить брони');
        this.isLoading.set(false);
      }
    });
  }

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  get monthLabel(): string {
    const d = this.currentDate();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  private buildCalendar(current: Date, bookings: IBooking[]): CalendarDay[] {
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    // Monday-based week: shift Sunday (0) to 7
    const startDow = firstDay.getDay() || 7;
    const days: CalendarDay[] = [];

    // Padding days from prev month
    for (let i = startDow - 1; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({ date, isCurrentMonth: false, isBooked: false, isCurrent: false, isToday: false, booking: null });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const isToday = date.getTime() === todayTime;
      const booking = bookings.find(b => this.dateInRange(date, b.check_in, b.check_out)) ?? null;
      const isCurrent = booking?.booking_status === 'current';
      days.push({ date, isCurrentMonth: true, isBooked: !!booking, isCurrent: !!isCurrent, isToday, booking });
    }

    // Pad to full weeks
    let nextMonthDay = 1;
    while (days.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextMonthDay++);
      days.push({ date, isCurrentMonth: false, isBooked: false, isCurrent: false, isToday: false, booking: null });
    }

    return days;
  }

  private dateInRange(date: Date, checkIn: string, checkOut: string): boolean {
    const d = date.getTime();
    const ci = new Date(checkIn);
    const from = new Date(ci.getFullYear(), ci.getMonth(), ci.getDate()).getTime();
    const co = new Date(checkOut);
    const to = new Date(co.getFullYear(), co.getMonth(), co.getDate()).getTime();
    return d >= from && d < to;
  }

  bookingStatus(booking: IBooking): 'upcoming' | 'current' | 'completed' {
    return booking.booking_status as 'upcoming' | 'current' | 'completed';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  nightsCount(booking: IBooking): number {
    const from = new Date(booking.check_in).getTime();
    const to = new Date(booking.check_out).getTime();
    return Math.round((to - from) / (1000 * 60 * 60 * 24));
  }
}
