import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plat } from '../../models/plat';

@Component({
  selector: 'app-carte-plat',
  imports: [RouterLink],
  templateUrl: './carte-plat.html',
  styleUrl: './carte-plat.css',
})
export class CartePlat {
  // Donnée reçue du parent : <app-carte-plat [plat]="...">
  // C'est un signal : on le lit avec plat().
  readonly plat = input.required<Plat>();

  // Passe à true quand le navigateur a fini de télécharger la photo.
  // Chaque carte a son propre signal : les photos arrivent une par une.
  protected readonly imageChargee = signal(false);
}
