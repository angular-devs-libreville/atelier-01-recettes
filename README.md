# Recettes

Petite application Angular de recherche de recettes, écrite comme support
d'atelier pour débutants (Angular Devs Libreville).

- **Démo en ligne : <https://atelier-01-recettes.vercel.app/>**
- **Code source : <https://github.com/angular-devs-libreville/atelier-01-recettes>**

On tape le nom d'un plat (en anglais : `fish`, `chicken`, `cake`…) et, dès
qu'on marque une pause de 400 ms, l'application affiche les recettes trouvées sous forme de cartes : photo, nom, pays d'origine, catégorie
et début des instructions. Un clic sur une carte ouvre la **page de détail**
de la recette : grande photo, liste des ingrédients, préparation complète et
lien vers la vidéo.

Les données viennent de [TheMealDB](https://www.themealdb.com), une API
gratuite qui ne demande pas d'inscription (on utilise la clé de test publique `1`).

L'application est découpée en **cinq composants**, volontairement simples :

| Composant        | Dossier                                                                                        | Rôle                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `App`            | [`src/app/`](src/app/app.ts)                                                                   | La racine : mise en page commune (titre) + `<router-outlet>`     |
| `Home`           | [`src/app/pages/home/`](src/app/pages/home/home.ts)                                            | La page : garde la recherche, appelle l'API, affiche les états   |
| `BarreRecherche` | [`src/app/components/barre-recherche/`](src/app/components/barre-recherche/barre-recherche.ts) | Le formulaire : prévient le parent à chaque frappe               |
| `CartePlat`      | [`src/app/components/carte-plat/`](src/app/components/carte-plat/carte-plat.ts)                | Une carte : affiche le plat qu'on lui donne, lien vers le détail |
| `DetailPlat`     | [`src/app/pages/detail-plat/`](src/app/pages/detail-plat/detail-plat.ts)                       | La page de détail : charge un plat par son id                    |

Chaque composant est réparti en **trois fichiers** portant le même nom :
`.ts` (la logique), `.html` (le template) et `.css` (les styles propres au
composant). Les dossiers suivent une convention simple : `pages/` pour les
composants affichés par le routeur, `components/` pour les briques
réutilisables, `models/` pour les types de données.

Les enfants ne savent rien de l'API : seul `Home` parle à TheMealDB. Les
enfants reçoivent des données (`input`) ou envoient des événements (`output`).
C'est le découpage le plus courant en Angular.

`App` reste volontairement presque vide : c'est l'endroit où l'on met ce qui
est commun à toutes les pages (en-tête, menu, pied de page). La page affichée
en dessous est choisie par le **routeur**, selon l'URL (voir
[`src/app/app.routes.ts`](src/app/app.routes.ts)).

---

## Lancer le projet

Prérequis : [Node.js](https://nodejs.org) 22.22+, 24.15+ ou 26+ (exigence d'Angular 22 ;
prenez la version LTS).

```bash
git clone https://github.com/angular-devs-libreville/atelier-01-recettes.git
cd atelier-01-recettes
npm install
npm start
```

Ouvrir ensuite <http://localhost:4200>. La page se recharge à chaque
modification du code.

Autres commandes utiles :

| Commande        | Rôle                                                 |
| --------------- | ---------------------------------------------------- |
| `npm start`     | Serveur de développement (`ng serve`)                |
| `npm test`      | Tests unitaires (Vitest), en mode surveillance       |
| `npm run build` | Version de production, générée dans `dist/recettes/` |

### Recréer le projet de zéro

C'est utile pour refaire l'atelier pas à pas :

```bash
npx @angular/cli@latest new recettes --ssr=false --style=css
cd recettes
npm install bootstrap
# ajouter Bootstrap dans angular.json (voir plus bas)
npm start
```

---

## Ce que fait l'application, état par état

L'écran affiche toujours **un seul** de ces cinq états :

| État           | Quand                                                | Affichage Bootstrap                         |
| -------------- | ---------------------------------------------------- | ------------------------------------------- |
| Accueil        | Aucune recherche lancée, ou bouton « Réinitialiser » | Texte d'invitation                          |
| Chargement     | La requête est partie, pas encore de réponse         | `spinner-border`                            |
| Erreur         | Réseau coupé, API indisponible…                      | `alert alert-danger` + bouton « Réessayer » |
| Aucun résultat | L'API a répondu `meals: null`                        | `alert alert-info`                          |
| Résultats      | Au moins une recette trouvée                         | Grille de `card`                            |

---

## Notions Angular illustrées

Le projet utilise volontairement les API **récentes** d'Angular (v22). Si vous
lisez un vieux tutoriel, vous y verrez souvent les anciennes façons de faire :
elles sont indiquées entre parenthèses.

### Composant standalone (pas de `NgModule`)

`App` est un composant autonome : il déclare lui-même ce dont il a besoin et
il est démarré directement dans `src/main.ts` avec `bootstrapApplication`.
Il n'y a aucun `NgModule` dans le projet. _(Anciennement : `AppModule` +
`declarations`.)_

### `signal()` pour l'état local

```ts
protected readonly recherche = signal('');
```

Un signal est une valeur qui prévient Angular quand elle change. On la lit en
l'appelant comme une fonction (`recherche()`) et on la modifie avec `.set()`.
Le template se met à jour tout seul.

### `computed()` pour une valeur dérivée

```ts
protected readonly plats = computed(() =>
  this.reponse.hasValue() ? (this.reponse.value().meals ?? []) : [],
);
```

`plats` est recalculé automatiquement chaque fois que `reponse` change.
Le template n'a donc qu'un tableau à parcourir, jamais `null`.

### `httpResource()` pour les données distantes

```ts
protected readonly reponse = httpResource<ReponseApi>(() =>
  this.recherche() === ''
    ? undefined
    : `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(this.recherche())}`,
);
```

C'est le cœur de l'atelier. `httpResource` reçoit une fonction qui construit
l'URL. Comme cette fonction lit le signal `recherche()`, Angular la
**réexécute dès que `recherche` change** et relance la requête. Si une requête
était encore en cours, elle est annulée.

- Si la fonction renvoie `undefined`, aucune requête n'est envoyée : c'est
  comme ça qu'on évite d'appeler l'API au démarrage.
- La ressource expose elle-même ses états sous forme de signaux :
  `isLoading()`, `error()`, `hasValue()`, `value()`. Il n'y a rien à gérer à la
  main.
- Pas de `subscribe`, pas d'opérateur RxJS. *(Anciennement : `HttpClient.get()`
  - `subscribe()` + un booléen `chargement` et une variable `erreur` à
    maintenir soi-même.)*
- `reponse.reload()` relance la même requête. C'est ce que fait le bouton
  « Réessayer » de l'alerte d'erreur : la recherche n'a pas changé, donc rien
  ne repartirait tout seul.

`httpResource` s'appuie sur `HttpClient`, fourni dans
[`src/app/app.config.ts`](src/app/app.config.ts) par `provideHttpClient()`.
Depuis Angular 21 cette ligne est facultative, mais elle montre d'où vient le
HTTP.

### Recherche pendant la frappe, avec `debounced()`

La recherche part toute seule pendant qu'on tape, sans bouton. Mais envoyer
une requête **à chaque lettre** serait du gaspillage : taper `chicken`
déclencherait 7 appels à l'API, dont 6 inutiles. On attend donc que
l'utilisateur fasse une **pause** de 400 ms : c'est ce qu'on appelle un
_debounce_.

**1. La barre de recherche prévient le parent à chaque frappe.** L'événement
DOM `(input)` se déclenche à chaque caractère tapé ou effacé. On lit la
valeur du champ grâce à une _variable de template_ (`#champ`) :

```html
<!-- components/barre-recherche/barre-recherche.html -->
<input #champ type="search" (input)="saisie.emit(champ.value)" />
```

**2. `Home` range la saisie dans un signal, puis la « ralentit ».**

```ts
// pages/home/home.ts
protected readonly saisie = signal('');

private readonly saisieStable = debounced(() => this.saisie().trim(), 400);

protected readonly recherche = computed(() =>
  this.saisie().trim() === '' ? '' : this.saisieStable.value(),
);
```

- `saisie` change à chaque lettre.
- `debounced()` (importé de `@angular/core`) surveille `saisie()` et ne
  recopie sa valeur que lorsqu'elle n'a pas bougé pendant 400 ms. Si on tape
  une nouvelle lettre avant, le compte à rebours repart de zéro. Il renvoie une
  **ressource** (comme `httpResource`), qu'on lit avec `.value()`. Pendant
  l'attente, `.value()` garde l'ancienne valeur.
- `recherche` est ce que lit `httpResource`. Cas particulier : quand le
  champ est vidé (bouton « Réinitialiser » ou touche Retour arrière), on
  n'attend pas, sinon les anciens résultats resteraient affichés 400 ms.

Résultat : en tapant `chicken` d'un trait, **une seule** requête part, 400 ms
après le `n`.

> `debounced()` est marqué **expérimental** dans Angular 22 : son nom ou sa
> forme peuvent encore changer dans une prochaine version. _(Anciennement :
> un `Subject` RxJS + les opérateurs `debounceTime()`,
> `distinctUntilChanged()` et `switchMap()`. Ici, `httpResource` joue déjà le
> rôle de `switchMap` en annulant la requête précédente.)_

Le formulaire garde un `(submit)="$event.preventDefault()"` : sans lui,
appuyer sur Entrée rechargerait la page, ce que fait le navigateur par défaut
quand on soumet un formulaire.

### Réinitialiser la recherche

Le bouton **Réinitialiser** est un bouton HTML standard `type="reset"` : le
navigateur vide le champ tout seul, sans une ligne de TypeScript. Il reste à
prévenir le parent, en écoutant l'événement `reset` du formulaire :

```html
<!-- components/barre-recherche/barre-recherche.html -->
<form (submit)="$event.preventDefault()" (reset)="reinitialiser.emit()">
  …
  <button type="reset">Réinitialiser</button>
</form>
```

`Home` remet alors le signal à vide : `(reinitialiser)="saisie.set('')"`.
`recherche()` devient aussitôt `''` (pas d'attente pour un champ vide), la
fonction d'URL renvoie `undefined`, donc `httpResource` n'envoie plus
rien (et annule une requête en cours) : l'écran revient à l'accueil. C'est
tout l'intérêt des signaux : on change **une** valeur, et tout ce qui en
dépend suit.

### Le nouveau flux de contrôle : `@if`, `@for`, `@empty`

```html
@if (reponse.isLoading()) { … } @else if (reponse.error()) { … } @else { … } @for (plat of plats();
track plat.idMeal) { …une carte… } @empty { …aucune recette… }
```

- `track plat.idMeal` est **obligatoire** : il permet à Angular de reconnaître
  chaque élément et de ne redessiner que ce qui change.
- `@empty` s'affiche quand le tableau est vide. C'est ce qui produit le
  message « Aucune recette ».

_(Anciennement : `*ngIf`, `*ngFor` et `CommonModule`.)_

### Le routeur : une URL → un composant

Les routes sont déclarées dans [`src/app/app.routes.ts`](src/app/app.routes.ts) :

```ts
export const routes: Routes = [
  { path: '', component: Home, title: 'Recettes' },
  { path: 'recette/:id', component: DetailPlat, title: 'Recette' },
  { path: '**', redirectTo: '' },
];
```

- `path: ''` est l'adresse d'accueil (`http://localhost:4200/`). On y affiche `Home`.
- `path: 'recette/:id'` affiche `DetailPlat`. `:id` est un **paramètre** : il
  prend la valeur écrite dans l'URL (`/recette/52802` → `id = '52802'`).
- `title` change le titre de l'onglet du navigateur.
- `path: '**'` attrape **toutes les autres URL**. Il doit toujours être en
  **dernier**, car le routeur prend la première route qui correspond.

Trois éléments doivent être branchés pour que ça marche :

1. `provideRouter(routes, withComponentInputBinding())` dans
   [`src/app/app.config.ts`](src/app/app.config.ts) ;
2. `RouterOutlet` dans les `imports` de `App` ;
3. la balise `<router-outlet />` dans le template de `App` : c'est l'endroit
   où le composant de la route active est affiché.

Remarquez que `App` n'importe plus `Home` : c'est le routeur qui le
connaît, pas la racine.

### La page de détail : `/recette/:id`

**Aller sur la page.** Dans `CartePlat`, le nom du plat est un lien :

```html
<a [routerLink]="['/recette', plat().idMeal]" class="stretched-link">{{ plat().strMeal }}</a>
```

- `routerLink` change de page **sans recharger** l'application (contrairement à
  un `href` classique). Le tableau `['/recette', '52802']` donne l'URL
  `/recette/52802`. Il faut importer `RouterLink` dans le composant.
- `stretched-link` est une classe Bootstrap qui étend la zone cliquable du lien
  à **toute la carte**, tout en gardant un vrai lien (utilisable au clavier,
  ouvrable dans un nouvel onglet).

**Recevoir l'id.** Grâce à `withComponentInputBinding()`, le routeur range
le paramètre `:id` directement dans un `input()` du même nom :

```ts
// pages/detail-plat/detail-plat.ts
readonly id = input.required<string>();

protected readonly reponse = httpResource<ReponseDetail>(
  () => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(this.id())}`,
);
```

C'est le même schéma que la recherche : un signal (`id`) → une URL → un
`httpResource` avec ses états (chargement, erreur, résultat). Et **le même
piège** : un id inconnu renvoie `200` avec `{ meals: null }`. Le `computed`
`plat` renvoie alors `null`, et la page affiche « Cette recette n'existe pas ».

**Les ingrédients.** L'API ne fournit pas de tableau, mais 20 paires de champs
numérotés (`strIngredient1`/`strMeasure1` … `strIngredient20`/`strMeasure20`),
dont beaucoup sont vides. Un `computed` les transforme en une vraie liste :

```ts
for (let i = 1; i <= 20; i++) {
  const ingredient = plat['strIngredient' + i]?.trim();
  if (ingredient) {
    liste.push({ ingredient, mesure: plat['strMeasure' + i]?.trim() ?? '' });
  }
}
```

Pour pouvoir écrire `plat['strIngredient' + i]`, l'interface `PlatDetail`
déclare `[champ: string]: string | null` : « n'importe quel autre champ est
un texte ou `null` ».

Dans le template, la boucle utilise `track $index` et non
`track ligne.ingredient` : un même ingrédient peut apparaître deux fois
(le _Fish pie_ contient deux fois `Lemon`), et `track` doit être unique.

**La préparation** garde ses retours à la ligne grâce à
`white-space: pre-line` dans `detail-plat.css` (Bootstrap n'a pas de classe
pour ça).

### Garder la recherche dans l'URL : `/?q=fish`

Chaque changement de page **détruit** le composant précédent, et ses signaux
avec. Sans précaution, en revenant du détail, `Home` repartirait de zéro :
champ vide, plus de résultats. La recherche est donc rangée **dans l'URL**,
qui, elle, survit au changement de page. Bonus : un rechargement (F5) ou un
lien partagé (`/?q=fish`) retrouve aussi la recherche.

Quatre pièces, toutes dans le code :

**1. `Home` écrit la recherche dans l'URL**, avec un `effect()` : une
fonction qui se relance chaque fois qu'un signal qu'elle lit change.

```ts
effect(() => {
  const q = this.recherche() || null; // null retire ?q= de l'URL
  this.router.navigate([], { queryParams: { q }, replaceUrl: true });
});
```

`replaceUrl: true` **remplace** l'adresse courante au lieu d'ajouter une page
à l'historique : sinon le bouton Précédent du navigateur repasserait par
chaque recherche tapée.

**2. `Home` relit l'URL en arrivant.** Grâce à `withComponentInputBinding()`,
le `?q=` arrive dans un input, comme le `:id` de `DetailPlat` :

```ts
readonly q = input<string>(); // undefined quand l'URL n'a pas de ?q=

ngOnInit() {
  this.saisie.set(this.q() ?? '');
}
```

`ngOnInit` est un _lifecycle hook_ : Angular l'appelle une fois, juste après
avoir rempli les inputs (dans le constructeur, ils sont encore vides).

Pourquoi **une seule fois**, et pas un `linkedSignal` qui suivrait `q()` en
permanence ? Parce que l'URL est mise à jour par la saisie elle-même : si
l'URL réécrivait la saisie à son tour, taper `chicken ` (avec un espace, pour
continuer) verrait l'espace effacé dès que l'URL passe à `?q=chicken`. Une
seule source de vérité à la fois : l'URL au démarrage, la saisie ensuite.

Au retour, la recherche repart **sans attendre 400 ms** : `debounced()`
prend directement la première valeur qu'il voit.

**3. Le champ réaffiche la recherche.** `BarreRecherche` reçoit le texte à
afficher : `readonly valeur = input('')`, lié avec `[value]="valeur()"` sur
l'`<input>`, et `Home` lui passe `[valeur]="saisie()"`.

**4. Les liens emportent le `?q=`.** Sur le lien de la carte comme sur le
bouton « Retour » du détail :

```html
<a [routerLink]="['/recette', plat().idMeal]" queryParamsHandling="preserve">…</a>
<a routerLink="/" queryParamsHandling="preserve">← Retour à la recherche</a>
```

`queryParamsHandling="preserve"` recopie les paramètres de l'URL courante
dans le lien : `/?q=fish` → `/recette/52802?q=fish` → `/?q=fish`. Le bouton
Précédent du navigateur marche aussi, puisque l'historique contient
`/?q=fish`.

### Communication parent ↔ enfant : `input()` et `output()`

Les données **descendent** du parent vers l'enfant avec `input()` :

```ts
// components/carte-plat/carte-plat.ts
readonly plat = input.required<Plat>();
```

```html
<!-- pages/home/home.html -->
<app-carte-plat [plat]="plat" />
```

`input.required` signifie que le parent est **obligé** de fournir la valeur
(sinon erreur de compilation). Un input est un signal : dans la carte, on le
lit avec `plat()`.

Les événements **remontent** de l'enfant vers le parent avec `output()` :

```ts
// components/barre-recherche/barre-recherche.ts
readonly saisie = output<string>();
```

```html
<!-- components/barre-recherche/barre-recherche.html -->
<input #champ (input)="saisie.emit(champ.value)" />

<!-- pages/home/home.html -->
<app-barre-recherche (saisie)="saisie.set($event)" />
```

`$event` contient la valeur passée à `emit()`, ici le texte du champ.

Un `output()` peut aussi n'envoyer **aucune valeur** : c'est le cas de
`reinitialiser = output()`, qui signale seulement « on repart de zéro ».

Pour utiliser un composant enfant, il faut l'ajouter au tableau `imports`
du parent : `imports: [BarreRecherche, CartePlat]`. _(Anciennement :
décorateurs `@Input()` et `@Output()` + `EventEmitter`.)_

### Un composant = trois fichiers

Le décorateur `@Component` relie la classe TypeScript à son template et à ses
styles :

```ts
@Component({
  selector: 'app-carte-plat',
  templateUrl: './carte-plat.html',
  styleUrl: './carte-plat.css',
})
export class CartePlat { … }
```

- Le **template** (`.html`) a accès à tout ce qui est déclaré dans la classe
  (signaux, méthodes), à condition que ce ne soit pas `private`. On utilise
  `protected` pour ce qui ne sert qu'au template.
- Les **styles** (`.css`) ne s'appliquent **qu'à ce composant** : la classe
  `.extrait` de `CartePlat` ne peut pas déborder ailleurs. Un fichier `.css`
  vide est normal : ici presque tout est fait avec les classes Bootstrap.
- Le **`selector`** (`app-carte-plat`) est le nom de la balise qui sert à
  utiliser le composant dans le template d'un autre.

C'est ce que génère `ng generate component` (ou `ng g c`), par exemple :
`ng g c components/detail-plat`.

---

## Comment Bootstrap est branché

Bootstrap est installé comme une dépendance npm, **sans CDN** :

```bash
npm install bootstrap
```

Puis sa feuille de style est déclarée dans `angular.json`, **avant** le
fichier de styles du projet (pour que nos propres règles puissent la
surcharger) :

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

> Après avoir modifié `angular.json`, il faut **arrêter et relancer**
> `npm start` : ce fichier n'est lu qu'au démarrage.

Choix volontaires :

- **CSS seulement, aucun JavaScript Bootstrap** (ni `bootstrap.bundle.js`, ni
  Popper). Tout ce qui bouge est géré par Angular. Mélanger les deux, c'est
  avoir deux outils qui modifient le même DOM sans se concerter.
- On se sert de la **grille** (`container`, `row`, `row-cols-*`, `col-*`, `g-4`)
  et des **classes utilitaires** (`py-4`, `mb-4`, `text-center`, `d-flex`,
  `w-100`, `d-block`, `h-100`…), plus quelques composants purement CSS : `card`, `badge`,
  `alert`, `spinner-border`, `placeholder`, `ratio`, `form-control`, `btn`.
- Responsive : la grille de résultats passe de 1 colonne (mobile) à 2 (`sm`),
  3 (`lg`) puis 4 (`xl`). Le champ et les deux boutons s'empilent sur mobile
  et se mettent côte à côte à partir de `md` : le champ (`col-md`) prend alors
  toute la place restante, puis est limité à la moitié de la largeur à partir
  de `lg` (`col-lg-6`).
- **Barre de recherche fixe** : sur `<app-barre-recherche>`, la classe
  `sticky-top` la garde collée en haut de l'écran pendant que les résultats
  défilent. `bg-body` lui donne un fond opaque (sinon les cartes se verraient
  au travers), `border-bottom` la sépare des résultats. Pas besoin de zone de
  défilement à hauteur fixe : c'est la page entière qui défile, ce qui reste
  naturel sur mobile.
- **Trois règles CSS maison seulement**, là où Bootstrap n'a pas de classe :
  - `.extrait` (`CartePlat`) coupe les instructions après 4 lignes
    (Bootstrap ne propose que `text-truncate`, qui coupe après une ligne) ;
  - une `transition` (`CartePlat`) fait apparaître la photo en fondu ;
  - `.instructions` (`DetailPlat`) garde les retours à la ligne de la
    préparation (`white-space: pre-line`).

### Un skeleton pendant le chargement des photos

Les cartes arrivent d'un coup, mais chaque photo se télécharge ensuite à son
rythme. En attendant, chaque carte affiche un **skeleton** : un bloc gris qui
pulse, fait avec les classes Bootstrap `placeholder-glow` et `placeholder`.

```html
<!-- components/carte-plat/carte-plat.html -->
<div class="ratio ratio-1x1">
  @if (!imageChargee()) {
  <div class="placeholder-glow"><span class="placeholder w-100 h-100"></span></div>
  }
  <img
    [src]="plat().strMealThumb"
    class="object-fit-cover"
    [class.opacity-0]="!imageChargee()"
    (load)="imageChargee.set(true)"
    (error)="imageChargee.set(true)"
  />
</div>
```

- `imageChargee = signal(false)` dans `CartePlat`. Chaque carte a **son
  propre** signal : les photos apparaissent une par une, dès qu'elles arrivent.
- `(load)` est un événement DOM standard de `<img>`, déclenché quand la photo
  est téléchargée. `(error)` aussi met fin au skeleton : sinon une photo
  introuvable laisserait un bloc qui pulse pour toujours.
- `[class.opacity-0]="…"` ajoute ou retire une classe selon une condition.
- Piège : on **cache** l'image avec `opacity-0`, on ne la retire pas avec un
  `@if`. Une `<img>` absente de la page n'est jamais téléchargée, donc
  `(load)` ne se déclencherait jamais.
- `ratio ratio-1x1` réserve un carré **avant** l'arrivée de la photo : la
  carte garde sa taille, rien ne « saute » à l'écran. `object-fit-cover`
  recadre la photo si elle n'est pas carrée.
- Avec `loading="lazy"`, les photos situées sous l'écran ne sont téléchargées
  qu'au moment où l'on fait défiler la page : leur skeleton reste donc affiché
  jusque-là. C'est normal.

---

## Le piège : `meals: null`

Quand une recherche ne trouve rien, on s'attendrait à recevoir un tableau vide.
TheMealDB répond autrement :

```
GET https://www.themealdb.com/api/json/v1/1/search.php?s=zzzz
→ 200 OK
{ "meals": null }
```

C'est un **succès HTTP (200)**, donc ce n'est pas traité comme une erreur. Mais
si l'on fait `@for (plat of reponse.value().meals; …)`, Angular reçoit `null`
au lieu d'un tableau et l'application plante.

La correction est dans le `computed` `plats` :

```ts
this.reponse.value().meals ?? [];
```

L'opérateur `??` remplace `null` (ou `undefined`) par un tableau vide. Le
`@for` reçoit toujours un tableau, et c'est `@empty` qui affiche « Aucune
recette ».

Un second piège se cache juste à côté : quand la requête a échoué, **lire
`value()` déclenche une erreur**. C'est pour ça qu'on teste `hasValue()` avant.

Morale : le type `Plat[] | null` de l'interface `ReponseApi` n'est pas là pour
décorer. Il oblige TypeScript à nous rappeler que `null` est possible.

Le test `gère meals: null sans planter` de
[`src/app/pages/home/home.spec.ts`](src/app/pages/home/home.spec.ts) vérifie ce cas.

---

## Structure des fichiers utiles

```
src/
├── index.html          page hôte, contient <app-root>
├── main.ts             démarre l'application
├── styles.css          styles globaux (vide, chargé après Bootstrap)
└── app/
    ├── app.ts / .html / .css           racine : titre + <router-outlet>
    ├── app.routes.ts                   routes : '' → Home, recette/:id → DetailPlat
    ├── app.config.ts                   fournisseurs globaux (HttpClient, routeur)
    ├── models/
    │   └── plat.ts                     interfaces Plat, ReponseApi, PlatDetail, ReponseDetail
    ├── pages/
    │   ├── detail-plat/
    │   │   ├── detail-plat.ts          ★ id (input du routeur), httpResource, ingrédients
    │   │   ├── detail-plat.html        photo, ingrédients, préparation, vidéo
    │   │   ├── detail-plat.css         .instructions (garde les retours à la ligne)
    │   │   └── detail-plat.spec.ts     tests : affichage, id inconnu, erreur
    │   └── home/
    │       ├── home.ts                 ★ la page : signal, debounced, httpResource, ?q= dans l'URL
    │       ├── home.html               états (chargement, erreur…) + grille
    │       ├── home.css
    │       └── home.spec.ts            tests : debounce, URL, affichage, meals: null, erreur, réinit.
    └── components/
        ├── barre-recherche/
        │   ├── barre-recherche.ts      reçoit la valeur (input), émet la saisie et la réinit. (output)
        │   ├── barre-recherche.html    formulaire
        │   └── barre-recherche.css
        └── carte-plat/
            ├── carte-plat.ts           reçoit un plat (input), sait si la photo est chargée
            ├── carte-plat.html         carte Bootstrap + skeleton de la photo
            ├── carte-plat.css          .extrait (4 lignes) + fondu de la photo
            └── carte-plat.spec.ts      tests : skeleton, photo, lien vers le détail
```

---

## Pour aller plus loin : exercices

### 1. Le nom du plat dans l'onglet

Sur la page de détail, l'onglet du navigateur affiche « Recette » pour tous
les plats (c'est le `title` de la route). Faites-le afficher le nom du plat,
par exemple « Fish pie ».

1. Dans `DetailPlat`, injectez le service `Title` de
   `@angular/platform-browser` : `private readonly titre = inject(Title)`.
2. Dans le constructeur, créez un `effect()` (voir celui de `Home`) qui lit
   `this.plat()` et, s'il n'est pas `null`, appelle
   `this.titre.setTitle(plat.strMeal)`.

### 2. Une recette au hasard

Ajoutez dans `Home` un bouton « Une idée ? » qui ouvre une recette tirée au
hasard. L'API propose `https://www.themealdb.com/api/json/v1/1/random.php`, qui
renvoie `{ meals: [unPlat] }`.

Indice : vous n'avez **pas** besoin d'appeler l'API depuis `Home`, ni de
créer une nouvelle route. L'adresse `/recette/hasard` correspond déjà à
`recette/:id`, avec `id = 'hasard'`. Le bouton devient donc un simple
`<a routerLink="/recette/hasard">`, et c'est `DetailPlat` qui choisit l'URL
à appeler selon que `id()` vaut `'hasard'` ou non.

### 3. Pour les plus curieux

Ouvrez une recette, puis remplacez l'id dans la barre d'adresse par un autre
(`/recette/52772`). La page se met-elle à jour ? Pourquoi `httpResource` n'a
rien eu à faire de spécial ? (Relisez la section sur `withComponentInputBinding`.)
