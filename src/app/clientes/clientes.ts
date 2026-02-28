import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../services/cliente';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Clientes</h1>
          <p class="page-subtitle">Gerencie seus clientes cadastrados</p>
        </div>
        <button class="btn-primary" (click)="novoCliente()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Cliente
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      } @else if (error) {
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ error }}</span>
          <button class="btn-ghost" (click)="carregar()">Tentar novamente</button>
        </div>
      } @else if (clientes.length === 0) {
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h3>Nenhum cliente cadastrado</h3>
          <p>Comece adicionando seu primeiro cliente ao sistema</p>
          <button class="btn-primary" (click)="novoCliente()">Adicionar Cliente</button>
        </div>
      } @else {
        <div class="card">
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th class="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (cliente of clientes; track cliente.id) {
                <tr>
                  <td>
                    <div class="cell-with-avatar">
                      <div class="avatar">{{ cliente.nome.charAt(0).toUpperCase() }}</div>
                      <span class="cell-name">{{ cliente.nome }}</span>
                    </div>
                  </td>
                  <td><span class="cell-mono">{{ cliente.documento }}</span></td>
                  <td>{{ cliente.email }}</td>
                  <td>{{ cliente.telefone }}</td>
                  <td class="td-actions">
                    <button class="btn-icon" (click)="editar(cliente.id)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" (click)="deletar(cliente.id)" title="Excluir">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; min-height: 100vh; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page-header h1 {
      font-size: 1.5rem; font-weight: 700; color: var(--gray-900, #0f172a);
      margin: 0; letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 0.875rem; color: var(--gray-500, #64748b); margin: 0.25rem 0 0;
    }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.125rem; background: var(--primary-600, #4f46e5);
      color: white; border: none; border-radius: var(--radius-md, 8px);
      font-weight: 600; font-size: 0.875rem; cursor: pointer;
      transition: all var(--transition, 0.2s);
    }
    .btn-primary:hover { background: var(--primary-700, #4338ca); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.25); }
    .btn-primary svg { stroke-linecap: round; stroke-linejoin: round; }

    .btn-ghost {
      padding: 0.5rem 0.875rem; background: transparent; color: var(--danger-600, #dc2626);
      border: 1px solid var(--danger-300, #fca5a5); border-radius: var(--radius-md, 8px);
      font-weight: 500; font-size: 0.8125rem; cursor: pointer; margin-left: auto;
    }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 400px; gap: 1rem; color: var(--gray-500, #64748b);
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--gray-200, #e2e8f0);
      border-top-color: var(--primary-500, #6366f1);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.875rem 1rem; border-radius: var(--radius-lg, 12px);
      font-size: 0.875rem; font-weight: 500;
    }
    .alert svg { flex-shrink: 0; stroke-linecap: round; stroke-linejoin: round; }
    .alert-error {
      background: var(--danger-50, #fef2f2); color: var(--danger-700, #b91c1c);
      border: 1px solid rgba(239,68,68,0.2);
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 4rem 2rem;
      background: white; border-radius: var(--radius-xl, 16px);
      border: 1px dashed var(--gray-300, #cbd5e1);
    }
    .empty-state svg { color: var(--gray-300, #cbd5e1); margin-bottom: 1rem; stroke-linecap: round; stroke-linejoin: round; }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: var(--gray-800, #1e293b); margin-bottom: 0.375rem; }
    .empty-state p { font-size: 0.875rem; color: var(--gray-500, #64748b); margin-bottom: 1.5rem; }

    .card {
      background: white; border-radius: var(--radius-xl, 16px);
      border: 1px solid var(--gray-200, #e2e8f0);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      overflow: hidden;
    }

    .table { width: 100%; border-collapse: collapse; }
    .table thead { background: var(--gray-50, #f8fafc); }
    .table th {
      padding: 0.75rem 1rem; text-align: left; font-weight: 600;
      font-size: 0.75rem; color: var(--gray-500, #64748b);
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid var(--gray-200, #e2e8f0);
    }
    .table td {
      padding: 0.875rem 1rem; font-size: 0.875rem;
      color: var(--gray-600, #475569);
      border-bottom: 1px solid var(--gray-100, #f1f5f9);
    }
    .table tbody tr { transition: background var(--transition, 0.2s); }
    .table tbody tr:hover { background: var(--gray-50, #f8fafc); }
    .table tbody tr:last-child td { border-bottom: none; }

    .th-actions, .td-actions { text-align: center; width: 100px; }

    .cell-with-avatar { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--primary-100, #e0e7ff); color: var(--primary-700, #4338ca);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8125rem; flex-shrink: 0;
    }
    .cell-name { font-weight: 600; color: var(--gray-800, #1e293b); }
    .cell-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8125rem; color: var(--gray-500, #64748b); }

    .td-actions { display: flex; gap: 0.375rem; justify-content: center; }
    .btn-icon {
      width: 32px; height: 32px; border: none; border-radius: var(--radius-sm, 6px);
      background: var(--gray-100, #f1f5f9); color: var(--gray-500, #64748b);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all var(--transition, 0.2s);
    }
    .btn-icon svg { stroke-linecap: round; stroke-linejoin: round; }
    .btn-icon:hover { background: var(--primary-50, #eef2ff); color: var(--primary-600, #4f46e5); }
    .btn-icon-danger:hover { background: var(--danger-50, #fef2f2); color: var(--danger-600, #dc2626); }

    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .page-header { flex-direction: column; gap: 1rem; }
      .btn-primary { width: 100%; justify-content: center; }
      .card { overflow-x: auto; }
      .table th, .table td { padding: 0.625rem 0.75rem; white-space: nowrap; }
    }
  `]
})
export class ClientesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private editModal = inject(EditModalService);
  private websocketService = inject(WebSocketService);

  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.carregar();
    this.iniciarWebSocket();
  }

  carregar() {
    this.loading = true;
    this.error = null;
    this.clienteService.listar().subscribe({
      next: (clientes) => { this.clientes = clientes; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao carregar clientes.'; this.toast.error(this.error); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  novoCliente() {
    this.toast.info('Funcionalidade em desenvolvimento');
  }

  async editar(id: string) {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;

    const result = await this.editModal.open({
      title: 'Editar Cliente',
      fields: [
        { key: 'id', label: 'ID', type: 'text', value: cliente.id, disabled: true },
        { key: 'nome', label: 'Nome', type: 'text', value: cliente.nome, placeholder: 'Nome do cliente' },
        { key: 'documento', label: 'Documento (CPF/CNPJ)', type: 'text', value: cliente.documento, disabled: true },
        { key: 'email', label: 'E-mail', type: 'email', value: cliente.email, placeholder: 'email@exemplo.com' },
        { key: 'telefone', label: 'Telefone', type: 'tel', value: cliente.telefone, placeholder: '(00) 00000-0000' },
      ],
    });

    if (!result) return;

    const updated = { ...cliente, nome: result['nome'] as string, email: result['email'] as string, telefone: result['telefone'] as string };
    this.clienteService.atualizar(id, updated).subscribe({
      next: () => { this.toast.success('Cliente atualizado com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao atualizar cliente.'); },
    });
  }

  async deletar(id: string) {
    const confirmed = await this.confirm.confirm({
      title: 'Excluir Cliente',
      message: 'Tem certeza que deseja excluir este cliente? Esta ação não poderá ser desfeita.',
      confirmText: 'Excluir', cancelText: 'Cancelar', type: 'danger',
    });
    if (!confirmed) return;
    this.clienteService.deletar(id).subscribe({
      next: () => { this.toast.success('Cliente excluído com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao excluir cliente.'); },
    });
  }

  iniciarWebSocket() {
    const websocketUrl = 'ws://localhost:8089/ws/clientes';
    this.websocketService.connect(websocketUrl);

    this.websocketService.onMessage().subscribe((data: any) => {
      if (data.type === 'clienteAtualizado') {
        const clienteAtualizado = data.payload;
        const index = this.clientes.findIndex((cliente) => cliente.id === clienteAtualizado.id);
        if (index !== -1) {
          this.clientes[index] = clienteAtualizado;
        } else {
          this.clientes.push(clienteAtualizado);
        }
        this.cdr.detectChanges();
      }
    });
  }
}
