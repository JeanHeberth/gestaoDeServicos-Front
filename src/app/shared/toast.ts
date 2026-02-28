import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toasts; track toast.id) {
        <div class="toast" [ngClass]="toast.type" role="alert">
          <div class="toast-bar" [ngClass]="toast.type"></div>
          <div class="toast-body">
            <span class="toast-icon">
              @switch (toast.type) {
                @case ('success') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> }
                @case ('error') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> }
                @case ('warning') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
                @case ('info') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
              }
            </span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button class="toast-close" (click)="close(toast.id)" aria-label="Fechar">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: center;
      background: white;
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
      border: 1px solid var(--gray-200, #e2e8f0);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .toast-bar {
      width: 4px;
      align-self: stretch;
      flex-shrink: 0;
    }

    .toast-bar.success { background: var(--success-500, #22c55e); }
    .toast-bar.error { background: var(--danger-500, #ef4444); }
    .toast-bar.warning { background: var(--warning-500, #f59e0b); }
    .toast-bar.info { background: var(--primary-500, #6366f1); }

    .toast-body {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
    }

    .toast-icon svg {
      width: 20px;
      height: 20px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .toast.success .toast-icon { color: var(--success-600, #16a34a); }
    .toast.error .toast-icon { color: var(--danger-600, #dc2626); }
    .toast.warning .toast-icon { color: var(--warning-600, #d97706); }
    .toast.info .toast-icon { color: var(--primary-600, #4f46e5); }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700, #334155);
      line-height: 1.35;
      min-width: 0;
      word-break: break-word;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--gray-400, #94a3b8);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      line-height: 1;
      transition: color 0.15s;
    }

    .toast-close:hover { color: var(--gray-600, #475569); }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];
  toasts: Toast[] = [];

  ngOnInit() {
    this.subs.push(
      this.toastService.toast$.subscribe((toast) => {
        this.toasts.push(toast);
        this.cdr.detectChanges(); // Força a detecção de mudanças
      }),
      this.toastService.remove$.subscribe((id) => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.cdr.detectChanges(); // Força a detecção de mudanças
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }

  close(id: number) {
    this.toastService.remove(id);
  }
}
