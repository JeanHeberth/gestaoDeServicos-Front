import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../services/cliente';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clientes-container">
      <header class="header">
        <div class="header-content">
          <h1>📋 Clientes</h1>
          <button class="btn-novo" (click)="novoCliente()">
            <span>➕</span> Novo Cliente
          </button>
        </div>
      </header>

      <main class="main-content">
        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Carregando clientes...</p>
          </div>
        } @else if (error) {
          <div class="error-message" role="alert">
            <span>❌</span> {{ error }}
            <button (click)="carregar()" class="btn-retry">Tentar novamente</button>
          </div>
        } @else if (clientes.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h2>Nenhum cliente cadastrado</h2>
            <p>Comece adicionando seu primeiro cliente</p>
            <button class="btn-novo" (click)="novoCliente()">
              <span>➕</span> Adicionar Cliente
            </button>
          </div>
        } @else {
          <div class="table-container">
            <table class="clientes-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of clientes; track cliente.id) {
                  <tr class="cliente-row">
                    <td class="nome">
                      <div class="avatar">{{ cliente.nome.charAt(0).toUpperCase() }}</div>
                      {{ cliente.nome }}
                    </td>
                    <td>{{ cliente.documento }}</td>
                    <td>{{ cliente.email }}</td>
                    <td>{{ cliente.telefone }}</td>
                    <td class="acoes">
                      <button class="btn-icon btn-edit" (click)="editar(cliente.id)" title="Editar">
                        ✏️
                      </button>
                      <button class="btn-icon btn-delete" (click)="deletar(cliente.id)" title="Deletar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .clientes-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
    }

    .btn-novo {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
    }

    .btn-novo:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      gap: 1rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(25, 118, 210, 0.2);
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #ffebee;
      border: 2px solid #d32f2f;
      border-radius: 8px;
      padding: 1.5rem;
      color: #d32f2f;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-retry {
      padding: 0.5rem 1rem;
      background: #d32f2f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      margin-left: auto;
    }

    .empty-state {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .clientes-table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f5f5f5;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 700;
      color: #333;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .cliente-row:hover {
      background: #f9f9f9;
    }

    td {
      padding: 1rem;
      color: #333;
      border-bottom: 1px solid #eee;
    }

    .nome {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .acoes {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background: #e3f2fd;
    }

    .btn-edit:hover {
      background: #1976d2;
      color: white;
    }

    .btn-delete {
      background: #ffebee;
    }

    .btn-delete:hover {
      background: #d32f2f;
      color: white;
    }
  `]
})
export class ClientesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.error = null;

    this.clienteService.listar().subscribe({
      next: (clientes) => {
        console.log('Clientes carregados:', clientes);
        this.clientes = clientes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.error = 'Erro ao carregar clientes. Verifique sua conexão.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  novoCliente() {
    alert('Funcionalidade em desenvolvimento');
  }

  editar(id: string) {
    alert('Editar cliente: ' + id);
  }

  deletar(id: string) {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return;

    this.clienteService.deletar(id).subscribe({
      next: () => {
        console.log('Cliente deletado');
        this.carregar();
      },
      error: (err) => {
        console.error('Erro ao deletar:', err);
        this.error = 'Erro ao deletar cliente.';
      },
    });
  }
}

