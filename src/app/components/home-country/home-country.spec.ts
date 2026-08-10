import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCountry } from './home-country';

describe('HomeCountry', () => {
  let component: HomeCountry;
  let fixture: ComponentFixture<HomeCountry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCountry],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeCountry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
