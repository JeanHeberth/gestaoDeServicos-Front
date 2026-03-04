import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario';
import { Router } from '@angular/router';
import { AutoFillGuardDirective } from '../shared/auto-fill-guard.directive';

@Component({
  selector: 'app-criar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFillGuardDirective],
  templateUrl: './criar-usuario.html',
  styleUrls: ['./criar-usuario.scss'],
})
export class CriarUsuarioComponent implements OnInit {
  usuario = {
    id: '',
    nome: '',
    email: '',
    senha: '',
    role: '',
  };

  constructor(private usuarioService: UsuarioService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.resetarCampos();
  }

  onCleared() {
    // auto-fill guard notificou limpeza, garantir modelo limpo
    this.usuario.email = '';
    this.usuario.senha = '';
    this.cdr.detectChanges();
  }

  resetarCampos() {
    this.usuario = {
      id: '',
      nome: '',
      email: '',
      senha: '',
      role: '',
    };
  }

  salvar() {
    this.usuarioService.criar({ ...this.usuario }).subscribe(() => {
      this.resetarCampos();
      this.router.navigate(['/usuarios']);
    });
  }
}
