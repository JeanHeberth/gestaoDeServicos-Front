import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmDialog } from '../services/confirm';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="overlay" (click)="cancel()" role="dialog" aria-modal="true">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon" [ngClass]="dialog?.type || 'danger'">
              @switch (dialog?.type) {
                @case ('warning') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
                @case ('info') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
                @default { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> }
              }
            </div>
            <div>
              <h2>{{ dialog?.title }}</h2>
              <p>{{ dialog?.message }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="cancel()">
              {{ dialog?.cancelText || 'Cancelar' }}
            </button>
            <button class="btn-confirm" [ngClass]="dialog?.type || 'danger'" (click)="confirmAction()">
              {{ dialog?.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.15s ease-out;
    }

    .modal {
      background: white;
      border-radius: var(--radius-xl, 16px);
      width: 90%;
      max-width: 420px;
      box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
      overflow: hidden;
      animation: scaleIn 0.2s ease-out;
    }

    .modal-header {
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon svg {
      width: 20px;
      height: 20px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .modal-icon.danger { background: var(--danger-50, #fef2f2); color: var(--danger-600, #dc2626); }
    .modal-icon.warning { background: var(--warning-50, #fffbeb); color: var(--warning-600, #d97706); }
    .modal-icon.info { background: var(--info-50, #eff6ff); color: var(--primary-600, #4f46e5); }

    .modal-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900, #0f172a);
    }

    .modal-header p {
      margin: 0.375rem 0 0;
      font-size: 0.875rem;
      color: var(--gray-500, #64748b);
      line-height: 1.5;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.625rem;
      background: var(--gray-50, #f8fafc);
      border-top: 1px solid var(--gray-200, #e2e8f0);
    }

    .btn-cancel {
      padding: 0.5rem 1rem;
      background: white;
      color: var(--gray-700, #334155);
      border: 1px solid var(--gray-300, #cbd5e1);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.15s;
    }

    .btn-cancel:hover { background: var(--gray-50, #f8fafc); }

    .btn-confirm {
      padding: 0.5rem 1rem;
      color: white;
      border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.15s;
    }

    .btn-confirm.danger { background: var(--danger-600, #dc2626); }
    .btn-confirm.danger:hover { background: var(--danger-700, #b91c1c); }

    .btn-confirm.warning { background: var(--warning-600, #d97706); }
    .btn-confirm.warning:hover { background: var(--warning-500, #f59e0b); }

    .btn-confirm.info { background: var(--primary-600, #4f46e5); }
    .btn-confirm.info:hover { background: var(--primary-700, #4338ca); }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  private confirmService = inject(ConfirmService);
  private sub?: Subscription;
  private resolveFn?: (value: boolean) => void;

  visible = false;
  dialog: ConfirmDialog | null = null;

  ngOnInit() {
    this.sub = this.confirmService.confirm$.subscribe(({ dialog, resolve }) => {
      this.dialog = dialog;
      this.resolveFn = resolve;
      this.visible = true;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  confirmAction() {
    this.resolveFn?.(true);
    this.visible = false;
  }

  cancel() {
    this.resolveFn?.(false);
    this.visible = false;
  }
}

