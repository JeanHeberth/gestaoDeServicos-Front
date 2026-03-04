import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VeiculoService } from '../services/veiculo.service';
import { AutoFillGuardDirective } from '../shared/auto-fill-guard.directive';
import { Cliente, ClienteService } from '../services/cliente';

@Component({
  selector: 'app-criar-veiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFillGuardDirective],
  templateUrl: './criar-veiculo.html',
  styleUrls: ['./criar-veiculo.scss'],
})
export class CriarVeiculoComponent implements OnInit {
  veiculo = { placa: '', marca: '', modelo: '', ano: null as number | null, cor: '', clienteNome: '' };
  clientes: Cliente[] = [];

  constructor(
    private veiculoService: VeiculoService,
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.carregarClientes();
    this.resetarCampos();
  }

  carregarClientes() {
    this.clienteService.listar().subscribe((clientes) => {
      this.clientes = clientes;
    });
  }

  onCleared() {
    this.veiculo.placa = '';
    this.veiculo.marca = '';
    this.veiculo.modelo = '';
    this.veiculo.ano = null;
    this.veiculo.cor = '';
    this.veiculo.clienteNome = '';
    this.cdr.detectChanges();
  }

  resetarCampos() {
    this.veiculo = { placa: '', marca: '', modelo: '', ano: null, cor: '', clienteNome: '' };
  }

  salvar() {
    const payload = {
      placa: this.veiculo.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      marca: this.veiculo.marca,
      modelo: this.veiculo.modelo,
      ano: this.veiculo.ano ?? undefined,
      cor: this.veiculo.cor || undefined,
      clienteNome: this.veiculo.clienteNome,
    };

    this.veiculoService.criar(payload).subscribe(() => {
      this.resetarCampos();
      this.router.navigate(['/veiculos']);
    });
  }
}
