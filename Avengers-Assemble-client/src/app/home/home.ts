import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MissionService } from '../_services/mission.service';
import { Mission } from '../_models/mission';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateMissionDialog } from '../create-mission-dialog/create-mission-dialog';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    DatePipe,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  missionService = inject(MissionService);
  dialog = inject(MatDialog);
  missions = signal<Mission[]>([]);
  platformId = inject(PLATFORM_ID);

  searchName: string = '';
  filterStatus: string | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMissions();
    }
  }

  loadMissions() {
    const params: any = {};
    if (this.searchName) params.name = this.searchName;
    if (this.filterStatus) params.status = this.filterStatus;

    this.missionService.getMissions(params).subscribe({
      next: (missions) => this.missions.set(missions),
      error: (err) => console.error(err)
    });
  }

  onSearchChange() {
    this.loadMissions();
  }

  clearSearch() {
    this.searchName = '';
    this.loadMissions();
  }

  openCreateMissionDialog() {
    const dialogRef = this.dialog.open(CreateMissionDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMissions();
      }
    });
  }
}
