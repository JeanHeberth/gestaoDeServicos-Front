import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Veiculo, VeiculoService } from '../services/veiculo.service';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { ClienteService } from '../services/cliente';

@Component({
  selector: 'app-veiculos',
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Veículos</h1>
          <p class="page-subtitle">Gerencie os veículos cadastrados</p>
        </div>
        <button class="btn-primary" (click)="novoVeiculo()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Veículo
        </button>
      </div>

      <div class="search-wrapper" role="search">
        <input
          #buscaInput
          class="search-input"
          type="text"
          [value]="busca"
          (input)="onBusca(buscaInput.value)"
          placeholder="Buscar por placa, marca, modelo, cliente, ano ou cor"
          aria-label="Buscar veículos"
        />
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando veículos...</p>
        </div>
      } @else if (error) {
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ error }}</span>
          <button class="btn-ghost" (click)="carregar()">Tentar novamente</button>
        </div>
      } @else if (veiculos.length === 0) {
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M4 12l1.5-4.2A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.3L20 12"/><path d="M3 12h18v5a1 1 0 0 1-1 1h-1a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H4a1 1 0 0 1-1-1v-5z"/><path d="M7 12h10"/><circle cx="7" cy="18" r="1"/><circle cx="17" cy="18" r="1"/></svg>
          <h3>Nenhum veículo cadastrado</h3>
          <p>Comece adicionando o primeiro veículo ao sistema</p>
          <button class="btn-primary" (click)="novoVeiculo()">Adicionar Veículo</button>
        </div>
      } @else {
        <div class="card">
          @if (veiculosFiltrados.length === 0) {
            <div class="no-results">Nenhum veículo encontrado para "{{ busca }}".</div>
          } @else {
            <table class="table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Cliente</th>
                  <th>Ano</th>
                  <th>Cor</th>
                  <th class="th-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (veiculo of veiculosFiltrados; track veiculo.placa) {
                  <tr>
                    <td><span class="cell-mono">{{ veiculo.placa }}</span></td>
                    <td><span class="cell-name">{{ veiculo.marca }}</span></td>
                    <td>{{ veiculo.modelo }}</td>
                    <td>{{ veiculo.clienteNome || '-' }}</td>
                    <td>{{ veiculo.ano ?? '-' }}</td>
                    <td>{{ veiculo.cor || '-' }}</td>
                    <td class="td-actions">
                      <button class="btn-icon" (click)="editar(veiculo)" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="btn-icon btn-icon-danger" (click)="deletar(veiculo.placa)" title="Excluir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; min-height: 100vh; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--gray-900, #0f172a); margin: 0; letter-spacing: -0.02em; }
    .page-subtitle { font-size: 0.875rem; color: var(--gray-500, #64748b); margin: 0.25rem 0 0; }

    .search-wrapper { margin-bottom: 1rem; }
    .search-input {
      width: 100%;
      max-width: 460px;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--gray-300, #cbd5e1);
      border-radius: var(--radius-md, 8px);
      font-size: 0.875rem;
      color: var(--gray-700, #334155);
      background: white;
      transition: border-color var(--transition, 0.2s), box-shadow var(--transition, 0.2s);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--primary-500, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .no-results {
      padding: 1rem;
      font-size: 0.875rem;
      color: var(--gray-500, #64748b);
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VeiculosComponent implements OnInit {
  private veiculoService = inject(VeiculoService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private editModal = inject(EditModalService);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  veiculos: Veiculo[] = [];
  clientesNomes: string[] = [];
  busca = '';
  private buscaDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  loading = false;
  error: string | null = null;

  get veiculosFiltrados(): Veiculo[] {
    const termo = this.normalizarTexto(this.busca);
    if (!termo) return this.veiculos;

    return this.veiculos.filter((veiculo) => {
      const campos = [
        veiculo.placa,
        veiculo.marca,
        veiculo.modelo,
        veiculo.clienteNome,
        veiculo.ano,
        veiculo.cor,
      ];
      return campos.some((campo) => this.normalizarTexto(campo).includes(termo));
    });
  }

  ngOnInit() {
    this.busca = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.carregarClientes();
    this.carregar();
  }

  carregarClientes() {
    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientesNomes = clientes.map((cliente) => cliente.nome);
      },
      error: () => {
        this.clientesNomes = [];
      },
    });
  }

  carregar() {
    this.loading = true;
    this.error = null;

    this.veiculoService.listar().subscribe({
      next: (veiculos) => {
        this.veiculos = veiculos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar veículos.';
        this.toast.error(this.error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  novoVeiculo() {
    this.router.navigate(['/criar-veiculo']);
  }

  onBusca(valor: string) {
    this.busca = valor;
    if (this.buscaDebounceTimer) {
      clearTimeout(this.buscaDebounceTimer);
    }
    this.buscaDebounceTimer = setTimeout(() => {
      this.atualizarBuscaNaUrl();
    }, 200);
  }

  async editar(veiculo: Veiculo) {
    const result = await this.editModal.open({
      title: 'Editar Veículo',
      fields: [
        { key: 'placa', label: 'Placa', type: 'text', value: veiculo.placa, disabled: true },
        { key: 'marca', label: 'Marca', type: 'text', value: veiculo.marca },
        { key: 'modelo', label: 'Modelo', type: 'text', value: veiculo.modelo },
        {
          key: 'clienteNome',
          label: 'Cliente',
          type: 'select',
          value: veiculo.clienteNome ?? '',
          options: this.clientesNomes.map((nome) => ({ value: nome, label: nome })),
        },
        { key: 'ano', label: 'Ano', type: 'text', value: veiculo.ano?.toString() ?? '' },
        { key: 'cor', label: 'Cor', type: 'text', value: veiculo.cor ?? '' },
      ],
    });

    if (!result) return;

    const anoRaw = (result['ano'] as string | undefined)?.trim();
    const ano = anoRaw ? Number(anoRaw) : undefined;

    const atualizado: Veiculo = {
      placa: veiculo.placa,
      marca: (result['marca'] as string) || veiculo.marca,
      modelo: (result['modelo'] as string) || veiculo.modelo,
      clienteNome: (result['clienteNome'] as string) || veiculo.clienteNome,
      ano: Number.isFinite(ano) ? ano : undefined,
      cor: (result['cor'] as string) || undefined,
    };

    this.veiculoService.atualizar(veiculo.placa, atualizado).subscribe({
      next: () => {
        this.toast.success('Veículo atualizado com sucesso!');
        this.carregar();
      },
      error: () => {
        this.toast.error('Erro ao atualizar veículo.');
      },
    });
  }

  async deletar(placa: string) {
    const confirmed = await this.confirm.confirm({
      title: 'Excluir Veículo',
      message: 'Tem certeza que deseja excluir o veículo de placa "' + placa + '"? Esta ação não poderá ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (!confirmed) return;

    this.veiculoService.deletar(placa).subscribe({
      next: () => {
        this.toast.success('Veículo excluído com sucesso!');
        this.carregar();
      },
      error: () => {
        this.toast.error('Erro ao excluir veículo.');
      },
    });
  }

  private normalizarTexto(valor: unknown): string {
    return String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private atualizarBuscaNaUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.busca || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
