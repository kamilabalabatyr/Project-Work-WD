import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { IProperty } from '../../interfaces/property.interface';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.scss'
})
export class PropertyDetail implements OnInit {
  property: IProperty | null = null;
  isLoading = true;
  errorMsg = '';
  successMsg = '';

  booking = {
    check_in: '',
    check_out: '',
    guests_count: 1
  };

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
        this.property = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Объект не найден';
        this.isLoading = false;
      }
    });
  }

  onBook(): void {
    if (!this.property) return;
    if (!this.booking.check_in || !this.booking.check_out) {
      this.errorMsg = 'Заполните даты бронирования';
      return;
    }

    this.bookingService.create({
      property: this.property.id,
      check_in: this.booking.check_in,
      check_out: this.booking.check_out,
      guests_count: this.booking.guests_count
    }).subscribe({
      next: () => {
        this.successMsg = 'Бронирование успешно создано!';
        this.booking = { check_in: '', check_out: '', guests_count: 1 };
        this.errorMsg = '';
      },
      error: () => {
        this.errorMsg = 'Не удалось создать бронирование';
      }
    });
  }

  onDelete(): void {
    if (!this.property) return;
    if (!confirm('Удалить это объявление?')) return;

    this.propertyService.delete(this.property.id).subscribe({
      next: () => {
        this.router.navigate(['/properties']);
      },
      error: () => {
        this.errorMsg = 'Не удалось удалить объявление';
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isOwner(): boolean {
    return this.authService.isLoggedIn();
  }

  getImage(): string {
    return `https://picsum.photos/seed/${this.property?.id}/800/400`;
  }
}