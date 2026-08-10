import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import * as L from 'leaflet';
import { Feature, GeoJsonObject } from 'geojson';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss'
})
export class WorldMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true })
  private mapElement!: ElementRef<HTMLDivElement>;

  private readonly travelService = inject(TravelService);

  private map?: L.Map;
  private geoJsonLayer?: L.GeoJSON;

  readonly isLoading = signal(true);
  readonly error = signal('');

  constructor() {
    effect(() => {
      const visitedCountries =
        this.travelService.visitedCountryCodes();

      this.updateCountryStyles(visitedCountries);
    });
  }

  ngAfterViewInit(): void {
    this.createMap();
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private createMap(): void {
    this.map = L.map(this.mapElement.nativeElement, {
      zoomControl: true,
      minZoom: 1,
      maxZoom: 7,
      attributionControl: false,
      worldCopyJump: false
    });

    this.map.setView([20, 0], 2);

    this.map.setMaxBounds([
      [-85, -180],
      [85, 180]
    ]);
  }

  private async loadCountries(): Promise<void> {
    try {
      const response = await fetch('/maps/countries.geojson');

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json() as GeoJsonObject;

      this.geoJsonLayer = L.geoJSON(data, {
        style: feature => this.getCountryStyle(feature),
        onEachFeature: (feature, layer) => {
          this.configureCountry(feature, layer);
        }
      });

      this.geoJsonLayer.addTo(this.map!);

      const bounds = this.geoJsonLayer.getBounds();

      if (bounds.isValid()) {
        this.map!.fitBounds(bounds, {
          padding: [10, 10]
        });
      }

      this.isLoading.set(false);
    } catch {
      this.error.set('The world map could not be loaded.');
      this.isLoading.set(false);
    }
  }

  private configureCountry(
    feature: Feature,
    layer: L.Layer
  ): void {
    const countryName = this.getCountryName(feature);
    const countryCode = this.getCountryCode(feature);

    layer.bindTooltip(countryName, {
      sticky: true,
      direction: 'top'
    });

    layer.on('mouseover', event => {
      const countryLayer = event.target as L.Path;

      countryLayer.setStyle({
        weight: 2,
        fillOpacity: 0.9
      });

      countryLayer.bringToFront();
    });

    layer.on('mouseout', event => {
      const countryLayer = event.target as L.Path;

      countryLayer.setStyle(
        this.createStyle(countryCode)
      );
    });

    layer.on('click', () => {
      if (!countryCode) {
        return;
      }

      const visits =
        this.travelService.getVisitsByCountry(countryCode);

      if (!visits.length) {
        layer
          .bindPopup(
            `<strong>${countryName}</strong><br>Not visited yet`
          )
          .openPopup();

        return;
      }

      const cities = Array.from(
        new Set(
          visits.flatMap(visit => visit.cities)
        )
      );

      const cityText = cities.length
        ? cities.join(', ')
        : 'No cities added';

      layer
        .bindPopup(
          `<strong>${countryName}</strong><br>${cityText}`
        )
        .openPopup();
    });
  }

  private getCountryStyle(
    feature?: Feature
  ): L.PathOptions {
    const countryCode = this.getCountryCode(feature);

    return this.createStyle(countryCode);
  }

  private createStyle(
    countryCode: string
  ): L.PathOptions {
    const visited =
      this.travelService.visitedCountryCodes().has(countryCode);

    return {
      fillColor: visited ? '#6366f1' : '#e5e7eb',
      fillOpacity: visited ? 0.85 : 0.65,
      color: '#ffffff',
      weight: 1
    };
  }

  private updateCountryStyles(
    visitedCountries: Set<string>
  ): void {
    if (!this.geoJsonLayer) {
      return;
    }

    this.geoJsonLayer.eachLayer(layer => {
      const countryLayer = layer as L.Path & {
        feature?: Feature;
      };

      if (!countryLayer.feature) {
        return;
      }

      const countryCode =
        this.getCountryCode(countryLayer.feature);

      const visited =
        visitedCountries.has(countryCode);

      countryLayer.setStyle({
        fillColor: visited ? '#6366f1' : '#e5e7eb',
        fillOpacity: visited ? 0.85 : 0.65,
        color: '#ffffff',
        weight: 1
      });
    });
  }

  private getCountryCode(
    feature?: Feature
  ): string {
    if (!feature?.properties) {
      return '';
    }

    const properties =
      feature.properties as Record<string, unknown>;

    const value =
      properties['ISO_A2_EH'] ??
      properties['ISO_A2'] ??
      properties['iso_a2'] ??
      properties['countryCode'];

    if (typeof value !== 'string') {
      return '';
    }

    return value.toUpperCase();
  }

  private getCountryName(
    feature?: Feature
  ): string {
    if (!feature?.properties) {
      return 'Unknown country';
    }

    const properties =
      feature.properties as Record<string, unknown>;

    const value =
      properties['NAME_EN'] ??
      properties['ADMIN'] ??
      properties['NAME'] ??
      properties['name'];

    if (typeof value !== 'string') {
      return 'Unknown country';
    }

    return value;
  }
}