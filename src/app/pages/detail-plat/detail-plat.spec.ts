import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DetailPlat } from './detail-plat';

describe('DetailPlat', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  // Affiche la page comme si l'URL était /recette/:id
  async function afficher(id: string) {
    const fixture = TestBed.createComponent(DetailPlat);
    fixture.componentRef.setInput('id', id);
    TestBed.tick();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('affiche le plat et ses ingrédients, sans les cases vides', async () => {
    const { fixture, element } = await afficher('52802');
    http.expectOne('https://www.themealdb.com/api/json/v1/1/lookup.php?i=52802').flush({
      meals: [
        {
          idMeal: '52802',
          strMeal: 'Fish pie',
          strMealThumb: 'https://example.com/fish.jpg',
          strArea: 'British',
          strCategory: 'Seafood',
          strInstructions: 'Étape 1\r\nÉtape 2',
          strYoutube: null,
          strIngredient1: 'Potatoes',
          strMeasure1: '900g',
          strIngredient2: 'Lemon',
          strMeasure2: '1',
          strIngredient3: '',
          strMeasure3: '',
        },
      ],
    });
    await fixture.whenStable();
    expect(element.querySelector('h2')?.textContent).toContain('Fish pie');
    expect(element.querySelectorAll('.list-group-item').length).toBe(2);
    expect(element.textContent).toContain('900g');
  });

  it('gère un id inconnu (meals: null)', async () => {
    const { fixture, element } = await afficher('1');
    http.expectOne(() => true).flush({ meals: null });
    await fixture.whenStable();
    expect(element.querySelector('.alert-warning')?.textContent).toContain("n'existe pas");
  });

  it('affiche une alerte en cas d’erreur réseau', async () => {
    const { fixture, element } = await afficher('52802');
    http.expectOne(() => true).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(element.querySelector('.alert-danger')).toBeTruthy();
  });
});
