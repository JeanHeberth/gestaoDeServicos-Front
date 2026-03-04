import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../services/toast';

// Flag de debounce para evitar múltiplos toasts/redirects quando muitas requisições 401 chegam ao mesmo tempo
let isHandling401 = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  const handle401 = () => {
    // Se já estivermos tratando um 401 recentemente, ignore
    if (isHandling401) return;
    isHandling401 = true;

    try { localStorage.removeItem('token'); } catch (e) {}
    try { toast.info('Sessão expirada. Faça login novamente.'); } catch (e) {}
    try { router.navigate(['/login'], { replaceUrl: true }); } catch (e) {}

    // Reset da flag após janela curta para permitir nova notificação caso necessário
    setTimeout(() => { isHandling401 = false; }, 3000);
  };

  const handleError = (err: unknown) => {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      handle401();
    }
    return throwError(() => err);
  };

  // Não adicionar token nas requisições de login
  if (req.url.includes('/auth/login')) {
    return next(req).pipe(catchError((err) => handleError(err)));
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned).pipe(catchError((err) => handleError(err)));
  }

  return next(req).pipe(catchError((err) => handleError(err)));
};
