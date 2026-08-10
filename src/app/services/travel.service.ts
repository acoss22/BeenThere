import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { TravelVisit } from '../models/travel-visit.model';
import { TravelProfile } from '../models/travel-profile.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private readonly visitsStorageKey = 'been-there-visits';
  private readonly profileStorageKey = 'been-there-profile';

  private readonly platformId = inject(PLATFORM_ID);

  private readonly visitsSignal = signal<TravelVisit[]>(
    this.loadVisits()
  );

  private readonly profileSignal = signal<TravelProfile>(
    this.loadProfile()
  );

  readonly visits = this.visitsSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();

  readonly visitedCountryCodes = computed(() =>
    new Set(
      this.visitsSignal().map(
        visit => visit.countryCode
      )
    )
  );

  readonly homeCountryCode = computed(
    () => this.profileSignal().homeCountryCode
  );

  addVisit(visit: TravelVisit): void {
    const updatedVisits = [
      ...this.visitsSignal(),
      visit
    ];

    this.visitsSignal.set(updatedVisits);
    this.saveVisits(updatedVisits);
  }

  removeVisit(id: string): void {
    const updatedVisits =
      this.visitsSignal().filter(
        visit => visit.id !== id
      );

    this.visitsSignal.set(updatedVisits);
    this.saveVisits(updatedVisits);
  }

  getVisit(id: string): TravelVisit | undefined {
    return this.visitsSignal().find(
      visit => visit.id === id
    );
  }

  getVisitsByCountry(
    countryCode: string
  ): TravelVisit[] {
    return this.visitsSignal().filter(
      visit =>
        visit.countryCode === countryCode
    );
  }

  hasVisitedCountry(
    countryCode: string
  ): boolean {
    return this.visitedCountryCodes().has(
      countryCode
    );
  }

  setHomeCountry(
    countryCode: string,
    countryName: string
  ): void {
    const profile: TravelProfile = {
      homeCountryCode: countryCode,
      homeCountryName: countryName
    };

    this.profileSignal.set(profile);
    this.saveProfile(profile);
  }

  clearHomeCountry(): void {
    const profile: TravelProfile = {};

    this.profileSignal.set(profile);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(
      this.profileStorageKey
    );
  }

  clearVisits(): void {
    this.visitsSignal.set([]);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(
      this.visitsStorageKey
    );
  }

  private saveVisits(
    visits: TravelVisit[]
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(
      this.visitsStorageKey,
      JSON.stringify(visits)
    );
  }

  private saveProfile(
    profile: TravelProfile
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(
      this.profileStorageKey,
      JSON.stringify(profile)
    );
  }

  private loadVisits(): TravelVisit[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const storedVisits =
      localStorage.getItem(
        this.visitsStorageKey
      );

    if (!storedVisits) {
      return [];
    }

    try {
      return JSON.parse(
        storedVisits
      ) as TravelVisit[];
    } catch {
      return [];
    }
  }

  private loadProfile(): TravelProfile {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    const storedProfile =
      localStorage.getItem(
        this.profileStorageKey
      );

    if (!storedProfile) {
      return {};
    }

    try {
      return JSON.parse(
        storedProfile
      ) as TravelProfile;
    } catch {
      return {};
    }
  }
}