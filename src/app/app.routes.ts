import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DetailPlat } from './pages/detail-plat/detail-plat';

// Chaque route associe une URL à un composant.
export const routes: Routes = [
  { path: '', component: Home, title: 'Recettes' },
  // :id est un paramètre : /recette/52802 donne id = '52802'.
  { path: 'recette/:id', component: DetailPlat, title: 'Recette' },
  // '**' attrape toutes les autres URL : on renvoie vers l'accueil.
  { path: '**', redirectTo: '' },
];
