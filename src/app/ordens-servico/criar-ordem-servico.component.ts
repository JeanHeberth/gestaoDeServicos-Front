import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdemServicoService } from '../services/ordem-servico';
import { ClienteService } from '../services/cliente';
import { Router } from '@angular/router';
import { AutoFillGuardDirective } from '../shared/auto-fill-guard.directive';

@Component({
  selector: 'app-criar-ordem-servico',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFillGuardDirective],
  templateUrl: './criar-ordem-servico.html',
  styleUrls: ['./criar-ordem-servico.scss'],
})
export class CriarOrdemServicoComponent implements OnInit {
  ordemServico = { id: '', descricao: '', clienteId: '', status: 'ABERTA', codigo: '', dataAbertura: new Date().toISOString(), dataFechamento: null };
  clientes: any[] = [];

  constructor(private ordemServicoService: OrdemServicoService, private clienteService: ClienteService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.carregarClientes(); this.resetarCampos(); }

  onCleared() {
    this.ordemServico.descricao = '';
    this.ordemServico.clienteId = '';
    this.cdr.detectChanges();
  }

  carregarClientes() { this.clienteService.listar().subscribe((clientes) => { this.clientes = clientes; }); }

  resetarCampos() { this.ordemServico = { id:'', descricao:'', clienteId:'', status:'ABERTA', codigo:'', dataAbertura: new Date().toISOString(), dataFechamento: null }; }

  salvar() { this.ordemServicoService.criar(this.ordemServico).subscribe(()=> this.router.navigate(['/ordens-servico'])); }
}
