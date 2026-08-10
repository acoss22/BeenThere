import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-home-country',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home-country.html',
  styleUrl: './home-country.scss'
})
export class HomeCountryComponent {
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
    { code: 'JP', name: 'Japan' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' }
  ];

  readonly homeCountry = new FormControl(
    this.travelService.homeCountryCode() ?? '',
    {
      nonNullable: true,
      validators: [Validators.required]
    }
  );

  readonly profile = this.travelService.profile;

  save(): void {
    if (this.homeCountry.invalid) {
      this.homeCountry.markAsTouched();
      return;
    }

    const country = this.countries.find(
      item => item.code === this.homeCountry.value
    );

    if (!country) {
      return;
    }

    this.travelService.setHomeCountry(
      country.code,
      country.name
    );
  }

  clear(): void {
    this.travelService.clearHomeCountry();
    this.homeCountry.setValue('');
  }
}