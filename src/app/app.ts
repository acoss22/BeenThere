import { Component } from '@angular/core';
import { AddVisitComponent } from './components/add-visit/add-visit.component';
import { WorldMapComponent } from './components/world-map/world-map.component';

@Component({
  selector: 'app-root',
  imports: [
    AddVisitComponent,
    WorldMapComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}