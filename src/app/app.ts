import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Composant racine : la mise en page commune à toutes les pages.
// La page affichée dépend de l'URL (voir app.routes.ts).
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
