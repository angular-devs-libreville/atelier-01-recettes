import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-barre-recherche',
  templateUrl: './barre-recherche.html',
  styleUrl: './barre-recherche.css',
})
export class BarreRecherche {
  // Texte à afficher dans le champ (utile au retour de la page de détail).
  readonly valeur = input('');

  // Envoyé au parent à chaque frappe : <app-barre-recherche (saisie)="...">
  readonly saisie = output<string>();

  // Événement sans valeur : il dit seulement « on repart de zéro ».
  readonly reinitialiser = output();
}
