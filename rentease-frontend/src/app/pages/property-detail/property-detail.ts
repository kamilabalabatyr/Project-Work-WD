import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { IProperty, getPropertyPhotoUrl } from '../../interfaces/property.interface';

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
  activeImageIndex = signal(0);

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
      error: (err) => {
        const msg = this.extractError(err);
        this.errorMsg.set(msg || 'Не удалось создать бронирование');
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
    const p = this.property();
    if (!p || !this.authService.isLoggedIn()) return false;
    return p.owner === this.authService.getUsername();
  }

  getImages(): string[] {
    const imgs = this.property()?.images;
    if (imgs && imgs.length > 0) return imgs.map(getPropertyPhotoUrl);
    return [getPropertyPhotoUrl('photo_0.jpg')];
  }

  setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  prevImage(): void {
    const len = this.getImages().length;
    this.activeImageIndex.update(i => (i - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.getImages().length;
    this.activeImageIndex.update(i => (i + 1) % len);
  }

  private extractError(err: any): string {
    if (!err?.error) return '';
    const e = err.error;
    if (typeof e === 'string') return e;
    if (Array.isArray(e)) return e[0];
    const values = Object.values(e);
    for (const v of values) {
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && v.length) return v[0];
    }
    return '';
  }
}
