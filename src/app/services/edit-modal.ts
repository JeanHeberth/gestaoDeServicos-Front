import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface EditField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'multi-select' | 'datetime-local';
  value: string | string[];
  disabled?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface EditModalConfig {
  title: string;
  fields: EditField[];
}

@Injectable({ providedIn: 'root' })
export class EditModalService {
  private openSubject = new Subject<{ config: EditModalConfig; resolve: (result: Record<string, unknown> | null) => void }>();
  open$ = this.openSubject.asObservable();

  open(config: EditModalConfig): Promise<Record<string, unknown> | null> {
    return new Promise((resolve) => {
      this.openSubject.next({ config, resolve });
    });
  }
}

