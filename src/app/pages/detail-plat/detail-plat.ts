import { Component, computed, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ReponseDetail } from '../../models/plat';

@Component({
  selector: 'app-detail-plat',
  imports: [RouterLink],
  templateUrl: './detail-plat.html',
  styleUrl: './detail-plat.css',
})
export class DetailPlat {
  // Rempli par le routeur avec le :id de l'URL /recette/:id
  // (grâce à withComponentInputBinding() dans app.config.ts).
  readonly id = input.required<string>();

  // Se relance tout seul si l'id change.
  protected readonly reponse = httpResource<ReponseDetail>(
    () => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(this.id())}`,
  );

  // Le plat, ou null si l'id n'existe pas (l'API répond alors meals: null).
  protected readonly plat = computed(() =>
    this.reponse.hasValue() ? (this.reponse.value().meals?.[0] ?? null) : null,
  );

  // Regroupe les 20 paires de champs en une liste, sans les cases vides.
  protected readonly ingredients = computed(() => {
    const plat = this.plat();
    const liste: { ingredient: string; mesure: string }[] = [];
    if (plat === null) {
      return liste;
    }
    for (let i = 1; i <= 20; i++) {
      const ingredient = plat['strIngredient' + i]?.trim();
      if (ingredient) {
        liste.push({ ingredient, mesure: plat['strMeasure' + i]?.trim() ?? '' });
      }
    }
    return liste;
  });
}
