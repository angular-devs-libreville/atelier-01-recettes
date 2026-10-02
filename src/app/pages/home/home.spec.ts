import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    // Fausse horloge : on avance le temps à la main au lieu d'attendre 400 ms.
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [Home],
      // Remplace le vrai réseau par un faux qu'on pilote depuis le test.
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Laisse passer le temps puis met l'écran à jour.
  async function attendre(ms: number) {
    await vi.advanceTimersByTimeAsync(ms);
    TestBed.tick();
  }

  // Affiche Home et tape un mot dans le champ, comme un utilisateur.
  async function taper(mot: string) {
    const fixture = TestBed.createComponent(Home);
    await attendre(0);
    const element = fixture.nativeElement as HTMLElement;
    const champ = element.querySelector('input')!;
    champ.value = mot;
    champ.dispatchEvent(new Event('input'));
    TestBed.tick();
    return element;
  }

  it("n'envoie aucune requête au démarrage", async () => {
    const element = await taper('');
    http.expectNone(() => true);
    expect(element.textContent).toContain('Commencez à taper');
  });

  it('attend 400 ms sans frappe avant d’appeler l’API', async () => {
    await taper('fish');
    await attendre(399);
    http.expectNone(() => true);
    await attendre(1);
    http.expectOne('https://www.themealdb.com/api/json/v1/1/search.php?s=fish');
  });

  it('affiche les cartes renvoyées par l’API', async () => {
    const element = await taper('fish');
    await attendre(400);
    http
      .expectOne(() => true)
      .flush({
        meals: [
          {
            idMeal: '1',
            strMeal: 'Fish pie',
            strMealThumb: 'https://example.com/fish.jpg',
            strArea: 'British',
            strCategory: 'Seafood',
            strInstructions: 'Cuire.',
          },
        ],
      });
    await attendre(0);
    expect(element.querySelectorAll('.card').length).toBe(1);
    expect(element.textContent).toContain('Fish pie');
  });

  it('gère meals: null sans planter', async () => {
    const element = await taper('zzz');
    await attendre(400);
    http.expectOne(() => true).flush({ meals: null });
    await attendre(0);
    expect(element.querySelector('.alert-info')?.textContent).toContain('Aucune recette');
  });

  it('revient à l’accueil tout de suite quand on réinitialise', async () => {
    const element = await taper('fish');
    await attendre(400);
    http.expectOne(() => true).flush({ meals: null });
    await attendre(0);

    element.querySelector<HTMLButtonElement>('button[type="reset"]')!.click();
    TestBed.tick();

    // Pas besoin d'attendre 400 ms : un champ vide est pris en compte immédiatement.
    expect(element.querySelector('input')!.value).toBe('');
    expect(element.querySelector('.alert')).toBeNull();
    expect(element.textContent).toContain('Commencez à taper');
  });

  it('écrit la recherche dans l’URL', async () => {
    await taper('fish');
    await attendre(400);
    // La navigation est asynchrone : on lui laisse le temps de se terminer.
    await attendre(0);
    expect(TestBed.inject(Router).url).toBe('/?q=fish');
  });

  it('reprend tout de suite la recherche contenue dans l’URL (?q=)', async () => {
    const fixture = TestBed.createComponent(Home);
    // Ce que fait le routeur en arrivant sur /?q=fish.
    fixture.componentRef.setInput('q', 'fish');
    TestBed.tick();
    // Pas d'attente de 400 ms : la requête part immédiatement.
    http.expectOne('https://www.themealdb.com/api/json/v1/1/search.php?s=fish');
    expect(fixture.nativeElement.querySelector('input').value).toBe('fish');
  });

  it('affiche une alerte en cas d’erreur réseau, avec un bouton pour réessayer', async () => {
    const element = await taper('fish');
    await attendre(400);
    http.expectOne(() => true).error(new ProgressEvent('error'));
    await attendre(0);
    expect(element.querySelector('.alert-danger')).toBeTruthy();

    element.querySelector<HTMLButtonElement>('.alert-danger button')!.click();
    TestBed.tick();
    http.expectOne(() => true);
  });
});
