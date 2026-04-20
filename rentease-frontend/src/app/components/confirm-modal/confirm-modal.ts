import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  @Input() title = '';
  @Input() text = '';
  @Input() icon = 'ci-Circle_Warning';
  @Input() iconVariant: 'danger' | 'warning' | 'primary' = 'danger';
  @Input() confirmLabel = 'Подтвердить';
  @Input() confirmVariant: 'danger' | 'warning' | 'primary' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();
}
