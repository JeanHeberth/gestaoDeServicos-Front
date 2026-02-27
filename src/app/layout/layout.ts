import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="/logo-borracharia.svg" alt="Logo" class="sidebar-logo" />
          <h2>Borracharia Pérola</h2>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/ordens-servico" routerLinkActive="active" class="nav-item">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <span class="nav-label">Ordens de Serviço</span>
          </a>
          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label">Clientes</span>
          </a>
          <a routerLink="/usuarios" routerLinkActive="active" class="nav-item">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="nav-label">Usuários</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="nav-label">Sair</span>
          </button>
        </div>
      </aside>

      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: var(--sidebar-width, 260px);
      background: var(--gray-900, #0f172a);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      transition: width var(--transition, 0.2s);
    }

    .sidebar-header {
      padding: 1.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
      flex-shrink: 0;
      border-radius: var(--radius-md, 8px);
    }

    .sidebar-header h2 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      white-space: nowrap;
      letter-spacing: -0.02em;
      color: rgba(255,255,255,0.95);
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      color: var(--gray-400, #94a3b8);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all var(--transition, 0.2s);
      border-left: 3px solid transparent;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-400, #818cf8);
      font-weight: 600;
      border-left-color: var(--primary-400, #818cf8);
    }

    .nav-svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .logout-btn {
      width: 100%;
      padding: 0.625rem 0;
      background: transparent;
      color: var(--gray-400, #94a3b8);
      border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all var(--transition, 0.2s);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logout-btn:hover {
      color: var(--danger-500, #ef4444);
    }

    .main {
      flex: 1;
      margin-left: var(--sidebar-width, 260px);
      background: var(--gray-50, #f8fafc);
      transition: margin-left var(--transition, 0.2s);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: var(--sidebar-collapsed, 72px);
      }

      .nav-label,
      .sidebar-header h2 {
        display: none;
      }

      .sidebar-header {
        justify-content: center;
        padding: 1.25rem;
      }

      .nav-item {
        justify-content: center;
        padding: 0.875rem;
        border-left: none;
      }

      .logout-btn {
        justify-content: center;
      }

      .main {
        margin-left: var(--sidebar-collapsed, 72px);
      }
    }
  `]
})
export class LayoutComponent {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}
