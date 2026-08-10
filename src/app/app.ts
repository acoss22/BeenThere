import { Component } from '@angular/core';
import { AddVisitComponent } from './components/add-visit/add-visit.component';
import { HomeCountryComponent } from './components/home-country/home-country';
import { WorldMapComponent } from './components/world-map/world-map.component';

@Component({
  selector: 'app-root',
  imports: [
    HomeCountryComponent,
    WorldMapComponent,
    AddVisitComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}