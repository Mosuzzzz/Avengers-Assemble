import { Component, computed, inject, Signal } from '@angular/core'
import { MissionService } from '../_services/mission-service'
import { MissionFilter } from '../_models/mission-filter'
import { Mission } from '../_models/mission'
import { FormsModule } from '@angular/forms'
import { BehaviorSubject } from 'rxjs'
import { AsyncPipe } from '@angular/common'
import { PassportService } from '../_services/passport-service'
import { MatDialog } from '@angular/material/dialog'
import { ViewDetails } from '../_dialogs/view-details/view-details'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { MatIconModule } from '@angular/material/icon'
import { SearchMissionDialog } from '../_dialogs/search-mission/search-mission';

@Component({
  selector: 'app-missions',
  imports: [FormsModule, AsyncPipe, MatTooltipModule, FaIconComponent, MatIconModule],
  templateUrl: './missions.html',
  styleUrl: './missions.scss',
})
export class Missions {
  private _mission = inject(MissionService)
  private _passport = inject(PassportService)
  private _dialog = inject(MatDialog)

  filter: MissionFilter = {
    name: '',
    status: undefined
  }

  private _missionsSubject = new BehaviorSubject<Mission[]>([])
  readonly missions$ = this._missionsSubject.asObservable()

  isSignin: Signal<boolean>
  famagnifyingglass = faMagnifyingGlass;

  constructor() {
    this.isSignin = computed(() => this._passport.data() !== undefined)
    this.loadMissions()
  }

  async openSearchDialog() {
    const ref = this._dialog.open(SearchMissionDialog, {
      data: { name: this.filter.name },
      panelClass: 'custom-dialog-container'
    });

    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result !== undefined) {
        this.filter.name = result;
        this.loadMissions();
      }
    });
  }

  async loadMissions() {
    const missions = await this._mission.getByFilter(this.filter)
    const mappedMissions = missions.map(m => ({
      ...m,
      created_at: new Date(m.created_at),
      updated_at: new Date(m.updated_at)
    }))
    this._missionsSubject.next(mappedMissions)
  }

  setStatus(status: string | undefined) {
    this.filter.status = status as any;
    this.loadMissions();
  }

  async onSubmit() {
    this.loadMissions()
  }

  async viewDetails(mission: Mission) {
    this._dialog.open(ViewDetails, { data: mission })
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
