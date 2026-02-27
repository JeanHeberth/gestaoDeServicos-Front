import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast';
import { ConfirmModalComponent } from './shared/confirm-modal';
import { EditModalComponent } from './shared/edit-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ConfirmModalComponent, EditModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gestaoDeServicos-Front');
}
