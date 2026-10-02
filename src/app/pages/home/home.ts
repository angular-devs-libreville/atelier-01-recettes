import {
  Component,
  OnInit,
  computed,
  debounced,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { BarreRecherche } from '../../components/barre-recherche/barre-recherche';
import { CartePlat } from '../../components/carte-plat/carte-plat';
import { ReponseApi } from '../../models/plat';

@Component({
  selector: 'app-home',
  // Un composant enfant doit être importé ici pour être utilisable dans le template.
  imports: [BarreRecherche, CartePlat],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly router = inject(Router);

  // Le ?q= de l'URL, rempli par le routeur (withComponentInputBinding).
  // undefined quand l'URL n'a pas de ?q=.
  readonly q = input<string>();

  // Ce qui est tapé dans le champ, mis à jour à chaque frappe.
  protected readonly saisie = signal('');

  // Copie de saisie() qui n'est mise à jour qu'après 400 ms sans frappe.
  // debounced() renvoie une ressource : on lit sa valeur avec .value().
  private readonly saisieStable = debounced(() => this.saisie().trim(), 400);

  // Le mot réellement cherché. Champ vidé : inutile d'attendre 400 ms.
  protected readonly recherche = computed(() =>
    this.saisie().trim() === '' ? '' : this.saisieStable.value(),
  );

  // httpResource relance la requête à chaque changement de recherche().
  // Renvoyer undefined veut dire : « ne fais aucune requête » (et annule
  // celle en cours).
  protected readonly reponse = httpResource<ReponseApi>(() =>
    this.recherche() === ''
      ? undefined
      : `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(this.recherche())}`,
  );

  // Toujours un tableau, même quand l'API répond meals: null.
  // On teste hasValue() d'abord : lire value() quand la requête a échoué lève une erreur.
  protected readonly plats = computed(() =>
    this.reponse.hasValue() ? (this.reponse.value().meals ?? []) : [],
  );

  constructor() {
    // Recopie la recherche dans l'URL (/?q=fish) pour la retrouver au retour du détail.
    // replaceUrl : on remplace l'adresse au lieu d'empiler une page dans l'historique.
    effect(() => {
      const q = this.recherche() || null; // null retire ?q= de l'URL
      this.router.navigate([], { queryParams: { q }, replaceUrl: true });
    });
  }

  // ngOnInit s'exécute une fois, quand les input() sont remplis :
  // on reprend la recherche contenue dans l'URL.
  // (Une seule fois : ensuite c'est la saisie qui met l'URL à jour, pas l'inverse.)
  ngOnInit() {
    this.saisie.set(this.q() ?? '');
  }
}
