import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService, Veiculo } from '../services/veiculo.service';

@Component({
  selector: 'app-buscar-veiculo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-veiculo.html',
  styleUrls: ['./buscar-veiculo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscarVeiculoComponent {
  private veiculoService = inject(VeiculoService);

  placaInput = '';
  veiculo = signal<Veiculo | null>(null);
  loading = signal(false);
  erro = signal<string | null>(null);

  buscar() {
    const raw = this.placaInput.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length < 6 || raw.length > 8) {
      this.erro.set('Placa inválida. Use o formato ABC1234 ou ABC1D23.');
      this.veiculo.set(null);
      return;
    }

    this.loading.set(true);
    this.erro.set(null);
    this.veiculo.set(null);

    this.veiculoService.buscarPorPlaca(raw).subscribe({
      next: (v) => {
        this.veiculo.set(v);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.status === 404
          ? 'Veículo não encontrado para a placa informada.'
          : err?.error?.message || 'Erro ao buscar veículo. Tente novamente.';
        this.erro.set(msg);
        this.loading.set(false);
      },
    });
  }
}

