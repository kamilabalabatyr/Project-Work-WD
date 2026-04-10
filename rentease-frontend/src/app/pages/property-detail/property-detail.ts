import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';
import { getPropertyImageUrl } from '../../utils/property-image.utils';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss'
})
export class PropertyDetail implements OnInit {
  property = signal<IProperty | null>(null);
  isLoading = signal(true);
  errorMsg = signal('');
  successMsg = signal('');

  booking = signal({ check_in: '', check_out: '', guests_count: 1 });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getById(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Объект не найден');
        this.isLoading.set(false);
      }
    });
  }

  onBook(): void {
    const p = this.property();
    const b = this.booking();
    if (!p) return;
    if (!b.check_in || !b.check_out) {
      this.errorMsg.set('Заполните даты бронирования');
      return;
    }

    this.bookingService.create({
      property: p.id,
      check_in: b.check_in,
      check_out: b.check_out,
      guests_count: b.guests_count
    }).subscribe({
      next: () => {
        this.successMsg.set('Бронирование успешно создано!');
        this.booking.set({ check_in: '', check_out: '', guests_count: 1 });
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Не удалось создать бронирование');
      }
    });
  }

  onDelete(): void {
    const p = this.property();
    if (!p) return;
    if (!confirm('Удалить это объявление?')) return;

    this.propertyService.delete(p.id).subscribe({
      next: () => this.router.navigate(['/properties']),
      error: () => this.errorMsg.set('Не удалось удалить объявление')
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isOwner(): boolean {
    return this.authService.isLoggedIn();
  }

  getImage(): string {
    const id = this.property()?.id ?? 0;
    return getPropertyImageUrl(id, 800, 400);
  }
}
