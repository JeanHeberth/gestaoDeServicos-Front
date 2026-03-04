import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../services/cliente';
import { Router } from '@angular/router';
import { AutoFillGuardDirective } from '../shared/auto-fill-guard.directive';

@Component({
  selector: 'app-criar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFillGuardDirective],
  templateUrl: './criar-cliente.html',
  styleUrls: ['./criar-cliente.scss'],
})
export class CriarClienteComponent implements OnInit {
  cliente = { id: '', nome: '', documento: '', email: '', telefone: '' };

  constructor(private clienteService: ClienteService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.resetarCampos(); }

  onCleared() {
    this.cliente.email = '';
    this.cliente.documento = '';
    this.cliente.telefone = '';
    this.cdr.detectChanges();
  }

  resetarCampos() { this.cliente = { id: '', nome: '', documento: '', email: '', telefone: '' }; }

  salvar() { this.clienteService.criar(this.cliente).subscribe(() => this.router.navigate(['/clientes'])); }
}
