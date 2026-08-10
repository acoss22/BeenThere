import { Injectable, computed, signal } from '@angular/core';
import { TravelVisit } from '../models/travel-visit.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private readonly storageKey = 'been-there-visits';

  private readonly visitsSignal = signal<TravelVisit[]>(
    this.loadVisits()
  );

  readonly visits = this.visitsSignal.asReadonly();

  readonly visitedCountryCodes = computed(() =>
    new Set(this.visitsSignal().map(visit => visit.countryCode))
  );

  addVisit(visit: TravelVisit): void {
    const updatedVisits = [...this.visitsSignal(), visit];

    this.visitsSignal.set(updatedVisits);
    this.saveVisits(updatedVisits);
  }

  removeVisit(id: string): void {
    const updatedVisits = this.visitsSignal().filter(
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

  getVisitsByCountry(countryCode: string): TravelVisit[] {
    return this.visitsSignal().filter(
      visit => visit.countryCode === countryCode
    );
  }

  hasVisitedCountry(countryCode: string): boolean {
    return this.visitedCountryCodes().has(countryCode);
  }

  clearVisits(): void {
    this.visitsSignal.set([]);
    localStorage.removeItem(this.storageKey);
  }

  private saveVisits(visits: TravelVisit[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(visits)
    );
  }

  private loadVisits(): TravelVisit[] {
    const storedVisits = localStorage.getItem(this.storageKey);

    if (!storedVisits) {
      return [];
    }

    try {
      return JSON.parse(storedVisits) as TravelVisit[];
    } catch {
      return [];
    }
  }
}