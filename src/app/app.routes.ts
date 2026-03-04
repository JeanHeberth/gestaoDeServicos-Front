import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { ClientesComponent } from './clientes/clientes';
import { OrdensServicoComponent } from './ordens-servico/ordens-servico';
import { UsuariosComponent } from './usuarios/usuarios';
import { LayoutComponent } from './layout/layout';
import { authGuard } from './guards/auth.guard';
import { CriarUsuarioComponent } from './usuarios/criar-usuario.component';
import { CriarClienteComponent } from './clientes/criar-cliente.component';
import { CriarOrdemServicoComponent } from './ordens-servico/criar-ordem-servico.component';
import { VeiculosComponent } from './veiculos/veiculos';
import { CriarVeiculoComponent } from './veiculos/criar-veiculo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'ordens-servico', component: OrdensServicoComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'criar-usuario', component: CriarUsuarioComponent },
      { path: 'criar-cliente', component: CriarClienteComponent },
      { path: 'criar-ordem-servico', component: CriarOrdemServicoComponent },
      { path: 'criar-veiculo', component: CriarVeiculoComponent },
      { path: 'veiculos', component: VeiculosComponent },
    ]
  },
  { path: '**', redirectTo: '/login' },
];
