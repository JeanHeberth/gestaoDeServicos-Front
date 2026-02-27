import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private confirmSubject = new Subject<{ dialog: ConfirmDialog; resolve: (value: boolean) => void }>();

  confirm$ = this.confirmSubject.asObservable();

  confirm(dialog: ConfirmDialog): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ dialog, resolve });
    });
  }
}

