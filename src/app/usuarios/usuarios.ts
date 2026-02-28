import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../services/usuario';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Usuários</h1>
          <p class="page-subtitle">Gerencie os usuários do sistema</p>
        </div>
        <button class="btn-primary" (click)="novoUsuario()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Usuário
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      } @else if (error) {
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ error }}</span>
          <button class="btn-ghost" (click)="carregar()">Tentar novamente</button>
        </div>
      } @else if (usuarios.length === 0) {
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <h3>Nenhum usuário cadastrado</h3>
          <p>Comece adicionando o primeiro usuário ao sistema</p>
          <button class="btn-primary" (click)="novoUsuario()">Adicionar Usuário</button>
        </div>
      } @else {
        <div class="card">
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfis</th>
                <th class="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (usuario of usuarios; track usuario.email) {
                <tr>
                  <td>
                    <div class="cell-with-avatar">
                      <div class="avatar">{{ usuario.nome.charAt(0).toUpperCase() }}</div>
                      <span class="cell-name">{{ usuario.nome }}</span>
                    </div>
                  </td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <span class="badge"
                      [class.badge-amber]="usuario.role === 'ADMINISTRADOR'"
                      [class.badge-blue]="usuario.role === 'USUARIO'">
                      {{ usuario.role }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <button class="btn-icon" (click)="editar(usuario)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" (click)="deletar(usuario)" title="Excluir">
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

    .roles { display: flex; gap: 0.375rem; flex-wrap: wrap; }
    .badge {
      display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px;
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .badge-blue { background: var(--primary-50, #eef2ff); color: var(--primary-700, #4338ca); }
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
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private editModal = inject(EditModalService);
  private websocketService = inject(WebSocketService);

  usuarios: Usuario[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.carregar();
    this.iniciarWebSocket();
  }

  carregar() {
    this.loading = true;
    this.error = null;
    this.usuarioService.listar().subscribe({
      next: (usuarios) => { this.usuarios = usuarios; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Erro ao carregar usuários.'; this.toast.error(this.error); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  novoUsuario() { this.toast.info('Funcionalidade em desenvolvimento'); }

  async editar(usuario: Usuario) {
    const result = await this.editModal.open({
      title: 'Editar Usuário',
      fields: [
        { key: 'nome', label: 'Nome', type: 'text', value: usuario.nome, placeholder: 'Nome do usuário' },
        { key: 'email', label: 'E-mail', type: 'email', value: usuario.email, disabled: true },
        { key: 'role', label: 'Perfil', type: 'select', value: usuario.role, options: [
          { value: 'USUARIO', label: 'USUARIO' },
          { value: 'ADMINISTRADOR', label: 'ADMINISTRADOR' },
        ]},
      ],
    });

    if (!result) return;

    const id = usuario.id;
    if (!id) return;

    const updated = { ...usuario, nome: result['nome'] as string, role: result['role'] as string };
    this.usuarioService.atualizar(id, updated).subscribe({
      next: () => { this.toast.success('Usuário atualizado com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao atualizar usuário.'); },
    });
  }

  async deletar(usuario: Usuario) {
    const confirmed = await this.confirm.confirm({
      title: 'Excluir Usuário',
      message: 'Tem certeza que deseja excluir o usuário "' + usuario.nome + '"? Esta ação não poderá ser desfeita.',
      confirmText: 'Excluir', cancelText: 'Cancelar', type: 'danger',
    });
    if (!confirmed) return;
    const id = usuario.id;
    if (!id) return;
    this.usuarioService.deletar(id).subscribe({
      next: () => { this.toast.success('Usuário excluído com sucesso!'); this.carregar(); },
      error: () => { this.toast.error('Erro ao excluir usuário.'); },
    });
  }

  iniciarWebSocket() {
    const websocketUrl = 'ws://localhost:8089/ws/usuarios';
    this.websocketService.connect(websocketUrl);

    this.websocketService.onMessage().subscribe((data: any) => {
      if (data.type === 'usuarioAtualizado') {
        const usuarioAtualizado = data.payload;
        const index = this.usuarios.findIndex((usuario) => usuario.id === usuarioAtualizado.id);
        if (index !== -1) {
          this.usuarios[index] = usuarioAtualizado;
        } else {
          this.usuarios.push(usuarioAtualizado);
        }
        this.cdr.detectChanges();
      }
    });
  }
}
