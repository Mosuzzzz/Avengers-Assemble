<<<<<<< HEAD
import { Component, computed, inject, signal, Signal, OnInit } from '@angular/core';
=======
import { Component, computed, inject, signal, Signal } from '@angular/core';
>>>>>>> d755a8d (0.0.1)
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { Mission } from '../../_models/mission';
import { DatePipe } from '@angular/common';
import { PassportService } from '../../_services/passport-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditMissionDialog } from '../edit-mission/edit-mission';
import { EditMission } from '../../_models/edit-mission';
import { MissionService } from '../../_services/mission-service';
<<<<<<< HEAD
import { MissionIntel, AddIntel } from '../../_models/intel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-details',
  imports: [DatePipe, MatTooltipModule, MatDialogClose, FormsModule],
=======

@Component({
  selector: 'app-view-details',
  imports: [DatePipe, MatTooltipModule, MatDialogClose],
>>>>>>> d755a8d (0.0.1)
  templateUrl: './view-details.html',
  styleUrl: './view-details.scss',
})
export class ViewDetails {

<<<<<<< HEAD
  private _missionService = inject(MissionService)
=======
  private _mission = inject(MissionService)
>>>>>>> d755a8d (0.0.1)
  private readonly _data = inject<Mission>(MAT_DIALOG_DATA)
  private _passport = inject(PassportService)
  private _dialog = inject(MatDialog)
  private _dialogRef = inject(MatDialogRef<ViewDetails>)
  display_name: Signal<string | undefined>
  mission = signal<Mission>({
    ...this._data
  })
  isMember = signal<boolean>(false)

<<<<<<< HEAD
  // Intel Hub
  intelList = signal<MissionIntel[]>([])
  newIntel = signal<string>("")

=======
>>>>>>> d755a8d (0.0.1)
  constructor() {
    this.display_name = computed(() => this._passport.data()?.display_name)
    this.refreshMission()
  }

<<<<<<< HEAD
  async loadIntel() {
    const list = await this._missionService.getIntel(this.mission().id)
    this.intelList.set(list)
  }

  async sendIntel() {
    if (!this.newIntel().trim()) return
    const add: AddIntel = { content: this.newIntel().trim() }
    await this._missionService.addIntel(this.mission().id, add)
    this.newIntel.set("")
    await this.loadIntel()
  }

=======
>>>>>>> d755a8d (0.0.1)

  getStatusClass(status: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-bold uppercase ';
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

  private async refreshMission() {
    try {
      // Re-fetch mission to get updated status and crew count
<<<<<<< HEAD
      const updated = await this._missionService.getOne(this.mission().id)
=======
      const updated = await this._mission.getOne(this.mission().id)
>>>>>>> d755a8d (0.0.1)
      if (updated) {
        this.mission.set({
          ...updated,
          created_at: new Date(updated.created_at),
          updated_at: new Date(updated.updated_at)
        })
      }

      // Check if current user is a member
<<<<<<< HEAD
      const crew = await this._missionService.getCrew(this.mission().id)
      const currentName = this.display_name()
      this.isMember.set(crew.some((member: any) => member.display_name === currentName))

      // Load Intel
      await this.loadIntel()
=======
      const crew = await this._mission.getCrew(this.mission().id)
      const currentName = this.display_name()
      this.isMember.set(crew.some(member => member.display_name === currentName))
>>>>>>> d755a8d (0.0.1)

    } catch (error) {
      console.error("Failed to refresh mission", error)
    }
  }

  async joinMission(mission: Mission) {
    try {
<<<<<<< HEAD
      await this._missionService.join(mission.id)
=======
      await this._mission.join(mission.id)
>>>>>>> d755a8d (0.0.1)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to Join mission", error)
      alert('Failed to join mission. (Ensure you are not the chief and the mission is open)')
    }
  }

  async leaveMission(mission: Mission) {
    try {
<<<<<<< HEAD
      await this._missionService.leave(mission.id)
=======
      await this._mission.leave(mission.id)
>>>>>>> d755a8d (0.0.1)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to Leave mission", error)
      alert('Failed to leave mission.')
    }
  }

  async failedMission(mission: Mission) {
    try {
<<<<<<< HEAD
      await this._missionService.fail(mission.id)
=======
      await this._mission.fail(mission.id)
>>>>>>> d755a8d (0.0.1)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to fail mission", error)
      alert('Operation failed.')
    }
  }

  async completedMission(mission: Mission) {
    try {
<<<<<<< HEAD
      await this._missionService.complete(mission.id)
=======
      await this._mission.complete(mission.id)
>>>>>>> d755a8d (0.0.1)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to complete mission", error)
      alert('Operation failed.')
    }
  }

  async startMission(mission: Mission) {
    try {
<<<<<<< HEAD
      await this._missionService.start(mission.id)
=======
      await this._mission.start(mission.id)
>>>>>>> d755a8d (0.0.1)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to Start mission", error)
      alert('Mission failed to start. (Ensure it has at least one crew member)')
    }
  }

  async deleteMission(mission: Mission) {
    if (confirm('Are you sure you want to delete this mission?')) {
      try {
<<<<<<< HEAD
        await this._missionService.delete(mission)
=======
        await this._mission.delete(mission)
>>>>>>> d755a8d (0.0.1)
        this._dialogRef.close(true)
      } catch (error) {
        console.error('Failed to delete mission', error)
      }
    }
  }

  async editMission(mission: Mission) {
    const ref = this._dialog.open(EditMissionDialog, {
      data: mission
    })

    ref.afterClosed().subscribe(async (editData: EditMission) => {
      if (editData) {
        try {
<<<<<<< HEAD
          await this._missionService.edit(mission.id, editData)
=======
          await this._mission.edit(mission.id, editData)
>>>>>>> d755a8d (0.0.1)

          // Update the signal directly for immediate UI feedback
          this.mission.update(current => ({
            ...current,
            name: editData.name || current.name,
            description: editData.description !== undefined ? editData.description : current.description,
            updated_at: new Date()
          }))

        } catch (error) {
          console.error('Failed to edit mission', error)
          alert('Failed to edit mission. Some missions cannot be edited if they have active crew.')
        }
      }
    })
  }

}
