// Forme d'un plat renvoyé par TheMealDB (on ne garde que ce qu'on affiche).
export interface Plat {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea: string;
  strCategory: string;
  strInstructions: string;
}

// Attention : quand rien ne correspond, l'API renvoie { meals: null }, pas [].
export interface ReponseApi {
  meals: Plat[] | null;
}

// Un plat complet, renvoyé par lookup.php. Les ingrédients sont rangés dans
// 20 champs numérotés : strIngredient1…strIngredient20 et strMeasure1…strMeasure20.
// [champ: string] permet de lire ces champs par leur nom : plat['strIngredient3'].
export interface PlatDetail extends Plat {
  strYoutube: string | null;
  [champ: string]: string | null;
}

// Même piège ici : un id inconnu donne { meals: null }.
export interface ReponseDetail {
  meals: PlatDetail[] | null;
}
