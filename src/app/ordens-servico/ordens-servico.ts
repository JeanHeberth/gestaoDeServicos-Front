import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, DatePipe } from '@angular/common';
import { OrdemServicoService, OrdemServico } from '../services/ordem-servico';
import { ClienteService, Cliente } from '../services/cliente';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Ordens de Serviço</h1>
          <p class="page-subtitle">Gerencie as ordens de serviço do sistema</p>
        </div>
        <button class="btn-primary" (click)="novaOS()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova OS
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando ordens de serviço...</p>
        </div>
      } @else if (error) {
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ error }}</span>
          <button class="btn-ghost" (click)="carregar()">Tentar novamente</button>
        </div>
      } @else if (ordens.length === 0) {
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <h3>Nenhuma ordem de serviço</h3>
          <p>Comece criando sua primeira OS no sistema</p>
          <button class="btn-primary" (click)="novaOS()">Criar OS</button>
        </div>
      } @else {
        <div class="card">
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Abertura</th>
                <th>Fechamento</th>
                <th class="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (os of ordens; track os.id) {
                <tr>
                  <td><span class="cell-mono">{{ os.codigo || '—' }}</span></td>
                  <td>
                    <div class="cell-with-avatar">
                      <div class="avatar">{{ os.descricao.charAt(0).toUpperCase() }}</div>
                      <span class="cell-name">{{ os.descricao }}</span>
                    </div>
                  </td>
                  <td>{{ clientesMap[os.clienteId] || os.clienteId }}</td>
                  <td>
                    <span class="badge"
                      [class.badge-blue]="os.status === 'ABERTA'"
                      [class.badge-green]="os.status === 'FECHADA'"
                      [class.badge-red]="os.status === 'CANCELADA'"
                      [class.badge-amber]="os.status === 'EM_ANDAMENTO'">
                      {{ os.status }}
                    </span>
                  </td>
                  <td>{{ os.dataAbertura ? (os.dataAbertura | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
                  <td>{{ os.dataFechamento ? (os.dataFechamento | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
                  <td class="td-actions">
                    <button class="btn-icon" (click)="editar(os.id)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" (click)="deletar(os.id)" title="Excluir">
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
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--gray-900, #0f172a); margin: 0; letter-spacing: -0.02em; }
    .page-subtitle { font-size: 0.875rem; color: var(--gray-500, #64748b); margin: 0.25rem 0 0; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.125rem; background: var(--primary-600, #4f46e5);
      color: white; border: none; border-radius: var(--radius-md, 8px);
      font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all var(--transition, 0.2s);
    }
    .btn-primary:hover { background: var(--primary-700, #4338ca); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.25); }
    .btn-primary svg { stroke-linecap: round; stroke-linejoin: round; }

    .btn-ghost {
      padding: 0.5rem 0.875rem; background: transparent; color: var(--danger-600, #dc2626);
      border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-md, 8px);
      font-weight: 500; font-size: 0.8125rem; cursor: pointer; margin-left: auto;
    }

    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; color: var(--gray-500, #64748b); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--gray-200, #e2e8f0); border-top-color: var(--primary-500, #6366f1); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: var(--radius-lg, 12px); font-size: 0.875rem; font-weight: 500; }
    .alert svg { flex-shrink: 0; stroke-linecap: round; stroke-linejoin: round; }
    .alert-error { background: var(--danger-50, #fef2f2); color: var(--danger-700, #b91c1c); border: 1px solid rgba(239,68,68,0.2); }

    .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4rem 2rem; background: white; border-radius: var(--radius-xl, 16px); border: 1px dashed var(--gray-300, #cbd5e1); }
    .empty-state svg { color: var(--gray-300, #cbd5e1); margin-bottom: 1rem; stroke-linecap: round; stroke-linejoin: round; }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: var(--gray-800, #1e293b); margin-bottom: 0.375rem; }
    .empty-state p { font-size: 0.875rem; color: var(--gray-500, #64748b); margin-bottom: 1.5rem; }

    .card { background: white; border-radius: var(--radius-xl, 16px); border: 1px solid var(--gray-200, #e2e8f0); box-shadow: var(--shadow-sm); overflow: hidden; }

    .table { width: 100%; border-collapse: collapse; }
    .table thead { background: var(--gray-50, #f8fafc); }
    .table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.75rem; color: var(--gray-500, #64748b); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--gray-200, #e2e8f0); }
    .table td { padding: 0.875rem 1rem; font-size: 0.875rem; color: var(--gray-600, #475569); border-bottom: 1px solid var(--gray-100, #f1f5f9); }
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
    .cell-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8125rem; color: var(--primary-600, #4f46e5); font-weight: 600; }

    .badge {
      display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px;
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .badge-blue { background: var(--primary-50, #eef2ff); color: var(--primary-700, #4338ca); }
    .badge-green { background: var(--success-50, #f0fdf4); color: var(--success-700, #15803d); }
    .badge-red { background: var(--danger-50, #fef2f2); color: var(--danger-700, #b91c1c); }
    .badge-amber { background: var(--warning-50, #fffbeb); color: var(--warning-600, #d97706); }

    .td-actions { display: flex; gap: 0.375rem; justify-content: center; }
    .btn-icon {
      width: 32px; height: 32px; border: none; border-radius: var(--radius-sm, 6px);
      background: var(--gray-100, #f1f5f9); color: var(--gray-500, #64748b);
      cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition, 0.2s);
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
export class OrdensServicoComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private osService = inject(OrdemServicoService);
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private editModal = inject(EditModalService);

  ordens: OrdemServico[] = [];
  clientesMap: Record<string, string> = {};
  loading = false;
  error: string | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.error = null;
    forkJoin({
      ordens: this.osService.listar(),
      clientes: this.clienteService.listar(),
    }).subscribe({
      next: ({ ordens, clientes }) => {
        this.clientesMap = {};
        clientes.forEach((c: Cliente) => { this.clientesMap[c.id] = c.nome; });
        this.ordens = ordens;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar ordens de serviço.';
        this.toast.error(this.error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  novaOS() { this.toast.info('Funcionalidade em desenvolvimento'); }

  async editar(id: string) {
    const os = this.ordens.find(o => o.id === id);
    if (!os) return;

    const result = await this.editModal.open({
      title: 'Editar Ordem de Serviço',
      fields: [
        { key: 'codigo', label: 'Código', type: 'text', value: os.codigo || '—', disabled: true },
        { key: 'descricao', label: 'Descrição', type: 'textarea', value: os.descricao, placeholder: 'Descrição do serviço' },
        { key: 'clienteId', label: 'Cliente', type: 'text', value: this.clientesMap[os.clienteId] || os.clienteId, disabled: true },
        { key: 'status', label: 'Status', type: 'select', value: os.status, options: [
          { value: 'ABERTA', label: 'Aberta' },
          { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
          { value: 'FECHADA', label: 'Fechada' },
          { value: 'CANCELADA', label: 'Cancelada' },
        ]},
        { key: 'dataAbertura', label: 'Data Abertura', type: 'text', value: os.dataAbertura || '—', disabled: true },
        { key: 'dataFechamento', label: 'Data Fechamento', type: 'text', value: os.dataFechamento || '—', disabled: true },
      ],
    });

    if (!result) return;

    const updated = { ...os, descricao: result['descricao'] as string, status: result['status'] as string };
    this.osService.atualizar(id, updated).subscribe({
      next: () => { this.toast.success('OS atualizada com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao atualizar ordem de serviço.'); },
    });
  }

  async deletar(id: string) {
    const confirmed = await this.confirm.confirm({
      title: 'Excluir Ordem de Serviço',
      message: 'Tem certeza que deseja excluir esta OS? Esta ação não poderá ser desfeita.',
      confirmText: 'Excluir', cancelText: 'Cancelar', type: 'danger',
    });
    if (!confirmed) return;

    this.osService.deletar(id).subscribe({
      next: () => { this.toast.success('OS excluída com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao excluir ordem de serviço.'); },
    });
  }
}
