import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();
  private removeSubject = new Subject<number>();

  toast$ = this.toastSubject.asObservable();
  remove$ = this.removeSubject.asObservable();

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: Toast['type']) {
    const id = ++this.counter;
    if (!message || message.trim() === '') {
      console.error('Toast message is empty or undefined.');
      return;
    }
    this.toastSubject.next({ id, message, type });

    setTimeout(() => {
      this.removeSubject.next(id);
    }, 2000);
  }

  remove(id: number) {
    this.removeSubject.next(id);
  }
}
