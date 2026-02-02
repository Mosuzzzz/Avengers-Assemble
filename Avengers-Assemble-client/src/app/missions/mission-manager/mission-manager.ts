import { Component, computed, inject, Signal } from '@angular/core'
import { MissionService } from '../../_services/mission-service'
import { MatDialog } from '@angular/material/dialog'
import { Mission } from '../../_models/mission'
import { NewMission } from '../../_dialogs/new-mission/new-mission'
import { AddMission } from '../../_models/add-mission'
import { MatIconModule } from '@angular/material/icon'
import { AsyncPipe } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { PassportService } from '../../_services/passport-service'
import { ViewDetails } from '../../_dialogs/view-details/view-details'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MissionFilter } from '../../_models/mission-filter'
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { SearchMissionDialog } from '../../_dialogs/search-mission/search-mission'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'


@Component({
  selector: 'app-mission-manager',
  imports: [MatIconModule, AsyncPipe, MatTooltipModule, FaIconComponent],
  templateUrl: './mission-manager.html',
  styleUrl: './mission-manager.scss',
})
export class MissionManager {

  private _mission = inject(MissionService)
  private _dialog = inject(MatDialog)
  private _passport = inject(PassportService)
  private _missionsSubject = new BehaviorSubject<Mission[]>([])
  readonly myMissions$ = this._missionsSubject.asObservable()

  famagnifyingglass = faMagnifyingGlass;

  filter: MissionFilter = {
    name: '',
    status: undefined
  }

  constructor() {
    this.loadMyMission()
  }

  async openSearchDialog() {
    const ref = this._dialog.open(SearchMissionDialog, {
      data: { name: this.filter.name },
      panelClass: 'custom-dialog-container'
    });

    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result !== undefined) {
        this.filter.name = result;
        this.loadMyMission();
      }
    });
  }

  setStatus(status: string | undefined) {
    this.filter.status = status as any;
    this.loadMyMission();
  }

  async loadMyMission() {
    let missions = await this._mission.getMyMissions()

    // Client-side filtering for My Missions
    if (this.filter.name) {
      const search = this.filter.name.toLowerCase()
      missions = missions.filter(m => m.name.toLowerCase().includes(search))
    }
    if (this.filter.status) {
      missions = missions.filter(m => m.status === this.filter.status)
    }

    const mappedMissions = missions.map(m => ({
      ...m,
      created_at: new Date(m.created_at),
      updated_at: new Date(m.updated_at)
    }))
    this._missionsSubject.next(mappedMissions)
  }

  openDialog() {
    let chief_display_name = this._passport.data()?.display_name || "unnamed"
    const ref = this._dialog.open(NewMission)
    ref.afterClosed().subscribe(async (addMission: AddMission) => {
      if (addMission) {
        const id = await this._mission.add(addMission)
        const now = new Date()
        const newMission: Mission = {
          id,
          name: addMission.name,
          description: addMission.description,
          status: 'Open',
          chief_id: 0,
          chief_display_name,
          crew_count: 0,
          created_at: now,
          updated_at: now
        }
        // เพิ่มข้อมูลใหม่เข้าไปใน BehaviorSubject
        const currentMissions = this._missionsSubject.value
        this._missionsSubject.next([...currentMissions, newMission])
      }
    })
  }



  async viewDetails(mission: Mission) {
    const ref = this._dialog.open(ViewDetails, { data: mission })
    ref.afterClosed().subscribe(() => {
      this.loadMyMission()
    })
  }

  getStatusClass(status: string): string {
    const base = 'px-3 py-2 text-xs uppercase font-bold rounded-full ';
    switch (status.toLowerCase()) {
      case 'open':
        return base + 'bg-green-100 text-green-700';
      case 'inprogress':
        return base + 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return base + 'bg-blue-100 text-blue-700';
      default:
        return base + 'bg-red-100 text-red-700';
    }
  }
}
