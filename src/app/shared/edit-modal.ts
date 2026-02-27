import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditModalService, EditModalConfig, EditField } from '../services/edit-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="overlay" (click)="cancel()" role="dialog" aria-modal="true">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ config?.title }}</h2>
            <button class="btn-close" (click)="cancel()" aria-label="Fechar">&times;</button>
          </div>
          <div class="modal-body">
            @for (field of config?.fields; track field.key) {
              <div class="field">
                <label [for]="field.key">{{ field.label }}</label>

                @if (field.disabled) {
                  <div class="field-readonly">
                    @if (field.type === 'multi-select') {
                      <div class="readonly-badges">
                        @for (v of asArray(field.value); track v) {
                          <span class="badge-readonly">{{ getLabelForValue(field, v) }}</span>
                        }
                      </div>
                    } @else {
                      {{ field.value }}
                    }
                  </div>
                } @else {
                  @switch (field.type) {
                    @case ('textarea') {
                      <textarea
                        [id]="field.key"
                        [(ngModel)]="values[field.key]"
                        [placeholder]="field.placeholder || ''"
                        rows="3"
                      ></textarea>
                    }
                    @case ('select') {
                      <select [id]="field.key" [(ngModel)]="values[field.key]">
                        @for (opt of field.options; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    }
                    @case ('multi-select') {
                      <div class="multi-select">
                        @for (opt of field.options; track opt.value) {
                          <label class="checkbox-label">
                            <input
                              type="checkbox"
                              [checked]="isChecked(field.key, opt.value)"
                              (change)="toggleMulti(field.key, opt.value)"
                            />
                            <span>{{ opt.label }}</span>
                          </label>
                        }
                      </div>
                    }
                    @default {
                      <input
                        [id]="field.key"
                        [type]="field.type"
                        [(ngModel)]="values[field.key]"
                        [placeholder]="field.placeholder || ''"
                      />
                    }
                  }
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="cancel()">Cancelar</button>
            <button class="btn-save" (click)="save()">Salvar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      display: flex; justify-content: center; align-items: center;
      z-index: 10000; animation: fadeIn 0.15s ease-out;
    }

    .modal {
      background: white;
      border-radius: var(--radius-xl, 16px);
      width: 90%; max-width: 520px; max-height: 90vh;
      box-shadow: var(--shadow-xl);
      display: flex; flex-direction: column;
      animation: scaleIn 0.2s ease-out;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-200, #e2e8f0);
      display: flex; justify-content: space-between; align-items: center;
    }

    .modal-header h2 {
      margin: 0; font-size: 1.125rem; font-weight: 600;
      color: var(--gray-900, #0f172a);
    }

    .btn-close {
      background: none; border: none; font-size: 1.5rem; cursor: pointer;
      color: var(--gray-400, #94a3b8); line-height: 1;
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border-radius: var(--radius-sm, 6px); transition: all 0.15s;
    }
    .btn-close:hover { background: var(--gray-100, #f1f5f9); color: var(--gray-600, #475569); }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex; flex-direction: column; gap: 1.125rem;
    }

    .field { display: flex; flex-direction: column; gap: 0.375rem; }

    .field label {
      font-size: 0.8125rem; font-weight: 600;
      color: var(--gray-700, #334155);
      text-transform: uppercase; letter-spacing: 0.04em;
    }

    .field input, .field textarea, .field select {
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--gray-300, #cbd5e1);
      border-radius: var(--radius-md, 8px);
      font-size: 0.9375rem;
      color: var(--gray-800, #1e293b);
      background: white;
      transition: all var(--transition, 0.2s);
      font-family: inherit;
    }

    .field input:focus, .field textarea:focus, .field select:focus {
      outline: none;
      border-color: var(--primary-500, #6366f1);
      box-shadow: 0 0 0 3px var(--primary-100, #e0e7ff);
    }

    .field textarea { resize: vertical; min-height: 80px; }

    .field-readonly {
      padding: 0.625rem 0.75rem;
      background: var(--gray-50, #f8fafc);
      border: 1px solid var(--gray-200, #e2e8f0);
      border-radius: var(--radius-md, 8px);
      color: var(--gray-500, #64748b);
      font-size: 0.9375rem;
      cursor: not-allowed;
    }

    .readonly-badges {
      display: flex; gap: 0.375rem; flex-wrap: wrap;
    }

    .badge-readonly {
      display: inline-block; padding: 0.2rem 0.5rem;
      background: var(--gray-200, #e2e8f0); color: var(--gray-600, #475569);
      border-radius: 9999px; font-size: 0.75rem; font-weight: 600;
    }

    .multi-select {
      display: flex; flex-direction: column; gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .checkbox-label {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.9375rem; color: var(--gray-700, #334155);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px; height: 18px; accent-color: var(--primary-600, #4f46e5);
      cursor: pointer;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-200, #e2e8f0);
      background: var(--gray-50, #f8fafc);
      display: flex; justify-content: flex-end; gap: 0.625rem;
      border-radius: 0 0 var(--radius-xl, 16px) var(--radius-xl, 16px);
    }

    .btn-cancel {
      padding: 0.5rem 1rem; background: white;
      color: var(--gray-700, #334155);
      border: 1px solid var(--gray-300, #cbd5e1);
      border-radius: var(--radius-md, 8px);
      cursor: pointer; font-weight: 500; font-size: 0.875rem;
      transition: all 0.15s;
    }
    .btn-cancel:hover { background: var(--gray-50, #f8fafc); }

    .btn-save {
      padding: 0.5rem 1.25rem; background: var(--primary-600, #4f46e5);
      color: white; border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer; font-weight: 600; font-size: 0.875rem;
      transition: all 0.15s;
    }
    .btn-save:hover { background: var(--primary-700, #4338ca); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class EditModalComponent implements OnInit, OnDestroy {
  private editModalService = inject(EditModalService);
  private sub?: Subscription;
  private resolveFn?: (result: Record<string, unknown> | null) => void;

  visible = false;
  config: EditModalConfig | null = null;
  values: Record<string, unknown> = {};

  ngOnInit() {
    this.sub = this.editModalService.open$.subscribe(({ config, resolve }) => {
      this.config = config;
      this.resolveFn = resolve;
      this.values = {};
      config.fields.forEach((f) => {
        if (!f.disabled) {
          this.values[f.key] = Array.isArray(f.value) ? [...f.value] : f.value;
        }
      });
      this.visible = true;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  asArray(val: string | string[]): string[] {
    return Array.isArray(val) ? val : [val];
  }

  getLabelForValue(field: EditField, value: string): string {
    return field.options?.find((o) => o.value === value)?.label || value;
  }

  isChecked(key: string, value: string): boolean {
    const arr = this.values[key];
    return Array.isArray(arr) && arr.includes(value);
  }

  toggleMulti(key: string, value: string) {
    const arr = this.values[key] as string[];
    if (!Array.isArray(arr)) {
      this.values[key] = [value];
      return;
    }
    const idx = arr.indexOf(value);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(value);
    }
  }

  save() {
    this.resolveFn?.({ ...this.values });
    this.visible = false;
  }

  cancel() {
    this.resolveFn?.(null);
    this.visible = false;
  }
}

