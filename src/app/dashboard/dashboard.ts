import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="header-content">
          <div class="logo-section">
            <h1>🛞 Borracharia Pérola</h1>
            <p class="subtitle">Sistema de Gestão de Serviços</p>
          </div>
          <nav class="nav">
            <div class="user-info">
              <span class="user-icon">👤</span>
              <div class="user-details">
                <p class="label">Usuário Autenticado</p>
                <p class="email">{{ userEmail }}</p>
              </div>
            </div>
            <button (click)="logout()" class="logout-btn">
              <span>🚪</span> Sair
            </button>
          </nav>
        </div>
      </header>

      <main class="main-content">
        <div class="welcome-card">
          <div class="welcome-icon">✨</div>
          <h2>Bem-vindo ao Sistema!</h2>
          <p class="welcome-text">Você foi autenticado com sucesso na Borracharia Pérola</p>
        </div>

        <div class="grid-content">
          <div class="info-card">
            <div class="card-icon">📊</div>
            <h3>Informações da Sessão</h3>
            <div class="card-details">
              <div class="detail-item">
                <span class="detail-label">E-mail:</span>
                <span class="detail-value">{{ userEmail }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value success">✅ Autenticado</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Token:</span>
                <span class="detail-value">Salvo com sucesso</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">🔐</div>
            <h3>Segurança</h3>
            <div class="card-details">
              <div class="detail-item">
                <span class="detail-label">Autenticação:</span>
                <span class="detail-value success">JWT Token</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Conexão:</span>
                <span class="detail-value success">Segura</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Backend:</span>
                <span class="detail-value">localhost:8089</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-card">
          <h3>Próximos Passos</h3>
          <ul class="steps-list">
            <li>✓ Login implementado e funcionando</li>
            <li>✓ Autenticação com JWT</li>
            <li>✓ Dashboard seguro</li>
            <li>→ Adicionar mais funcionalidades</li>
            <li>→ Gerenciar serviços</li>
            <li>→ Controlar clientes</li>
          </ul>
        </div>
      </main>

      <footer class="footer">
        <p>&copy; 2026 Borracharia Pérola - Todos os direitos reservados</p>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      flex-direction: column;
    }

    .header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .logo-section h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
    }

    .user-icon {
      font-size: 1.5rem;
    }

    .user-details p {
      margin: 0;
    }

    .label {
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .email {
      font-weight: 600;
    }

    .logout-btn {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .main-content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
      width: 100%;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      margin-bottom: 3rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .welcome-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .welcome-card h2 {
      color: #1976d2;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .welcome-text {
      color: #666;
      font-size: 1.1rem;
    }

    .grid-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .info-card h3 {
      color: #1976d2;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .detail-label {
      font-weight: 600;
      color: #333;
    }

    .detail-value {
      color: #666;
    }

    .detail-value.success {
      color: #2e7d32;
      font-weight: 600;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .action-card h3 {
      color: #1976d2;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }

    .steps-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .steps-list li {
      padding: 1rem;
      background: #f0f7ff;
      border-left: 4px solid #1976d2;
      border-radius: 6px;
      color: #333;
    }

    .footer {
      background: rgba(0, 0, 0, 0.1);
      color: #333;
      text-align: center;
      padding: 2rem;
      margin-top: auto;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .nav {
        flex-direction: column;
        width: 100%;
      }

      .user-info {
        width: 100%;
      }

      .logout-btn {
        width: 100%;
        justify-content: center;
      }

      .logo-section h1 {
        font-size: 1.5rem;
      }

      .welcome-card h2 {
        font-size: 1.5rem;
      }

      .grid-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  userEmail: string = '';

  ngOnInit() {
    // Verificar se está no navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Verificar se há token
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Decodificar token para obter e-mail (JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.sub || 'Usuário';
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      this.userEmail = 'Usuário';
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}

