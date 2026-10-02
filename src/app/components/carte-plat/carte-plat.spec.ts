import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartePlat } from './carte-plat';

describe('CartePlat', () => {
  beforeEach(() => {
    // routerLink a besoin du routeur, même sans routes.
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  async function afficher() {
    const fixture = TestBed.createComponent(CartePlat);
    // setInput remplit l'input comme le ferait le parent avec [plat]="...".
    fixture.componentRef.setInput('plat', {
      idMeal: '1',
      strMeal: 'Fish pie',
      strMealThumb: 'https://example.com/fish.jpg',
      strArea: 'British',
      strCategory: 'Seafood',
      strInstructions: 'Cuire.',
    });
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('affiche un skeleton tant que la photo n’est pas chargée', async () => {
    const { element } = await afficher();
    expect(element.querySelector('.placeholder')).toBeTruthy();
    expect(element.querySelector('img')!.classList).toContain('opacity-0');
  });

  it('affiche la photo une fois chargée', async () => {
    const { fixture, element } = await afficher();
    // Simule la fin du téléchargement de l'image.
    element.querySelector('img')!.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(element.querySelector('.placeholder')).toBeNull();
    expect(element.querySelector('img')!.classList).not.toContain('opacity-0');
  });

  it('pointe vers la page de détail', async () => {
    const { element } = await afficher();
    expect(element.querySelector('a')!.getAttribute('href')).toBe('/recette/1');
  });

  it('retire aussi le skeleton si la photo ne peut pas être chargée', async () => {
    const { fixture, element } = await afficher();
    element.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(element.querySelector('.placeholder')).toBeNull();
  });
});
