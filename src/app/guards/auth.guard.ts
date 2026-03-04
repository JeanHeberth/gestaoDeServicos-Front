import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  const isBrowser = isPlatformBrowser(platformId);
  console.log('[AuthGuard] Rota:', route.routeConfig?.path);
  console.log('[AuthGuard] isPlatformBrowser:', isBrowser);

  // No servidor, permite acesso (não redireciona)
  if (!isBrowser) {
    console.log('[AuthGuard] Servidor - permitindo acesso');
    return true;
  }

  const token = localStorage.getItem('token');
  console.log('[AuthGuard] Token encontrado:', !!token);

  if (token) {
    return true;
  }

  console.log('[AuthGuard] Sem token - redirecionando para /login');
  return router.createUrlTree(['/login']);
};

