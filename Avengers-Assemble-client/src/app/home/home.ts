import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MissionService } from '../_services/mission.service';
import { Mission } from '../_models/mission';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatButtonModule, MatChipsModule, DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  missionService = inject(MissionService);
  missions = signal<Mission[]>([]);
  platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMissions();
    }
  }

  loadMissions() {
    this.missionService.getMissions().subscribe({
      next: (missions) => this.missions.set(missions),
      error: (err) => console.error(err)
    });
  }
}
