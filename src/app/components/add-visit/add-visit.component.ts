import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TravelService } from '../../services/travel.service';
import { TravelVisit } from '../../models/travel-visit.model';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-visit.component.html',
  styleUrl: './add-visit.component.scss'
})
export class AddVisitComponent {
  private readonly fb = inject(FormBuilder);
  private readonly travelService = inject(TravelService);

  readonly countries = [
    { code: 'PT', name: 'Portugal' },
    { code: 'ES', name: 'Spain' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'IE', name: 'Ireland' },
    { code: 'DE', name: 'Germany' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'NO', name: 'Norway' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'JP', name: 'Japan' }
  ];

  readonly form = this.fb.group({
    countryCode: ['', Validators.required],
    visitedAt: [''],
    cities: this.fb.array([
      this.fb.control('', Validators.required)
    ])
  });

  get cities(): FormArray {
    return this.form.controls.cities;
  }

  addCity(): void {
    this.cities.push(
      this.fb.control('', Validators.required)
    );
  }

  removeCity(index: number): void {
    if (this.cities.length === 1) {
      return;
    }

    this.cities.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const country = this.countries.find(
      item => item.code === value.countryCode
    );

    if (!country) {
      return;
    }

    const visit: TravelVisit = {
      id: crypto.randomUUID(),
      countryCode: country.code,
      countryName: country.name,
      visitedAt: value.visitedAt || undefined,
      cities: value.cities
        .filter((city): city is string => Boolean(city))
        .map(city => city.trim())
        .filter(Boolean)
    };

    this.travelService.addVisit(visit);

    this.form.reset();

    this.cities.clear();
    this.cities.push(
      this.fb.control('', Validators.required)
    );
  }
}