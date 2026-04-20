import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { IProperty } from '../../interfaces/property.interface';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';

interface PendingAction {
  type: 'deactivate' | 'reactivate';
  property: IProperty;
}

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [ConfirmModal],
  templateUrl: './admin-applications.html',
  styleUrl: './admin-applications.scss',
})
export class AdminApplications implements OnInit {
  pending = signal<IProperty[]>([]);
  approved = signal<IProperty[]>([]);
  inactive = signal<IProperty[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  processingId = signal<number | null>(null);
  pendingAction = signal<PendingAction | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    let done = 0;
    let hasError = false;

    const checkDone = () => { if (++done === 3) this.isLoading.set(false); };
    const onError = () => { if (!hasError) { hasError = true; this.errorMsg.set('Не удалось загрузить заявки'); } checkDone(); };

    this.adminService.getPendingProperties().subscribe({
      next: (data) => { this.pending.set(data); checkDone(); },
      error: onError
    });

    this.adminService.getApprovedProperties().subscribe({
      next: (data) => { this.approved.set(data); checkDone(); },
      error: onError
    });

    this.adminService.getInactiveProperties().subscribe({
      next: (data) => { this.inactive.set(data); checkDone(); },
      error: onError
    });
  }

  approve(property: IProperty) {
    this.processingId.set(property.id);
    this.adminService.approveProperty(property.id).subscribe({
      next: (updated) => {
        this.pending.update(list => list.filter(p => p.id !== updated.id));
        this.approved.update(list => [updated, ...list]);
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null)
    });
  }

  reject(property: IProperty) {
    const reason = prompt(`Причина отклонения объявления "${property.title}":`, '');
    if (reason === null) return;
    this.processingId.set(property.id);
    this.adminService.rejectProperty(property.id, reason).subscribe({
      next: (updated) => {
        this.pending.update(list => list.filter(p => p.id !== updated.id));
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null)
    });
  }

  deactivate(property: IProperty) {
    this.pendingAction.set({ type: 'deactivate', property });
  }

  reactivate(property: IProperty) {
    this.pendingAction.set({ type: 'reactivate', property });
  }

  confirmAction() {
    const action = this.pendingAction();
    if (!action) return;
    this.pendingAction.set(null);
    this.processingId.set(action.property.id);

    if (action.type === 'deactivate') {
      this.adminService.deactivateProperty(action.property.id).subscribe({
        next: (updated) => {
          this.approved.update(list => list.filter(p => p.id !== updated.id));
          this.inactive.update(list => [updated, ...list]);
          this.processingId.set(null);
        },
        error: () => this.processingId.set(null)
      });
    } else {
      this.adminService.reactivateProperty(action.property.id).subscribe({
        next: (updated) => {
          this.inactive.update(list => list.filter(p => p.id !== updated.id));
          this.approved.update(list => [updated, ...list]);
          this.processingId.set(null);
        },
        error: () => this.processingId.set(null)
      });
    }
  }

  dismissAction() {
    this.pendingAction.set(null);
  }

  get modalConfig() {
    const action = this.pendingAction();
    if (!action) return null;
    if (action.type === 'deactivate') {
      return {
        title: 'Деактивировать объявление?',
        text: `«${action.property.title}» перестанет отображаться для гостей. Вы сможете активировать его обратно.`,
        icon: 'ci-Hide',
        iconVariant: 'warning' as const,
        confirmLabel: 'Деактивировать',
        confirmVariant: 'warning' as const,
      };
    }
    return {
      title: 'Активировать объявление?',
      text: `«${action.property.title}» снова станет доступно для бронирования гостями.`,
      icon: 'ci-Show',
      iconVariant: 'primary' as const,
      confirmLabel: 'Активировать',
      confirmVariant: 'primary' as const,
    };
  }
}
