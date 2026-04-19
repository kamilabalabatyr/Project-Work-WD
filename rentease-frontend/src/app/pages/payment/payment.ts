import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

type PageState = 'form' | 'loading' | 'success' | 'failed';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment implements OnInit, OnDestroy {
  bookingId = signal(0);
  state = signal<PageState>('form');
  errorMsg = signal('');
  countdown = signal(5);

  card = signal({ number: '', expiry: '', cvv: '', cardholder: '' });

  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  private isValidExpiry(expiry: string): boolean {
  if (expiry.length !== 5) return false;

  const [monthStr, yearStr] = expiry.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt('20' + yearStr, 10); // 26 → 2026

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();  
  const currentMonth = now.getMonth() + 1; 

  if (year < currentYear) return false;

  if (year === currentYear && month < currentMonth) return false;

  return true;
}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('bookingId'));
    this.bookingId.set(id);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    this.card.update(c => ({ ...c, number: formatted }));
    input.value = formatted;
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    this.card.update(c => ({ ...c, expiry: digits }));
    input.value = digits;
  }

  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    this.card.update(c => ({ ...c, cvv: digits }));
    input.value = digits;
  }

  onSubmit(): void {
    const c = this.card();
    if (!c.number || !c.expiry || !c.cvv || !c.cardholder) {
      this.errorMsg.set('Заполните все поля');
      return;
    }
    if (!this.isValidExpiry(c.expiry)) {
    this.errorMsg.set('Неверный срок действия карты');
    return;
  }
    this.state.set('loading');
    this.errorMsg.set('');

    this.paymentService.process({
      booking_id: this.bookingId(),
      card_number: c.number,
      expiry: c.expiry,
      cvv: c.cvv,
      cardholder: c.cardholder,
    }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.state.set('success');
          this.startCountdown();
        } else {
          this.state.set('failed');
        }
      },
      error: (err) => {
        const msg = this.extractError(err);
        this.errorMsg.set(msg || 'Ошибка при обработке платежа');
        this.state.set('form');
      }
    });
  }

  retryPayment(): void {
    this.state.set('form');
    this.errorMsg.set('');
    this.card.set({ number: '', expiry: '', cvv: '', cardholder: '' });
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(next);
      if (next <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/my-bookings']);
      }
    }, 1000);
  }

  private extractError(err: any): string {
    if (!err?.error) return '';
    const e = err.error;
    if (typeof e === 'string') return e;
    if (Array.isArray(e)) return e[0];
    const values = Object.values(e);
    for (const v of values) {
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && v.length) return String(v[0]);
    }
    return '';
  }
}
