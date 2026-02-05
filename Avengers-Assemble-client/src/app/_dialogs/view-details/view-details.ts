import { Component, computed, inject, signal, Signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { Mission } from '../../_models/mission';
import { DatePipe } from '@angular/common';
import { PassportService } from '../../_services/passport-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditMissionDialog } from '../edit-mission/edit-mission';
import { EditMission } from '../../_models/edit-mission';
import { MissionService } from '../../_services/mission-service';
import { MissionIntel, AddIntel } from '../../_models/intel';
import { FormsModule } from '@angular/forms';
import { PasswordPromptDialog } from '../password-prompt/password-prompt'

@Component({
  selector: 'app-view-details',
  imports: [DatePipe, MatTooltipModule, MatDialogClose, FormsModule, PasswordPromptDialog],
  templateUrl: './view-details.html',
  styleUrl: './view-details.scss',
})
export class ViewDetails {

  private _missionService = inject(MissionService)
  private readonly _data = inject<Mission>(MAT_DIALOG_DATA)
  private _passport = inject(PassportService)
  private _dialog = inject(MatDialog)
  private _dialogRef = inject(MatDialogRef<ViewDetails>)
  display_name: Signal<string | undefined>
  mission = signal<Mission>({
    ...this._data
  })
  crew = signal<any[]>([])
  isMember = computed(() => {
    const current = this.display_name()?.trim().toLowerCase()
    return !!current && this.crew().some((member: any) =>
      member.display_name?.trim().toLowerCase() === current
    )
  })
  isChief = computed(() => {
    const current = this.display_name()?.trim().toLowerCase()
    const chief = this.mission().chief_display_name?.trim().toLowerCase()
    return !!current && current === chief
  })

  // Intel Hub
  intelList = signal<MissionIntel[]>([])
  newIntel: string = ""

  constructor() {
    this.display_name = computed(() => this._passport.data()?.display_name)
    this.refreshMission()
  }

  async loadIntel() {
    try {
      const list = await this._missionService.getIntel(this.mission().id)
      this.intelList.set(list)
    } catch (error) {
      console.error("Failed to load intel", error)
    }
  }

  async sendIntel() {
    if (!this.newIntel.trim()) return
    try {
      const add: AddIntel = { content: this.newIntel.trim() }
      await this._missionService.addIntel(this.mission().id, add)
      this.newIntel = ""
      await this.loadIntel()
    } catch (error: any) {
      console.error("Failed to send intel", error)
      alert(error.error || "You must join the mission first to report operational intel.")
    }
  }


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
      const updated = await this._missionService.getOne(this.mission().id)
      if (updated) {
        this.mission.set({
          ...updated,
          created_at: new Date(updated.created_at),
          updated_at: new Date(updated.updated_at)
        })
      }

      // Fetch crew data
      const crewData = await this._missionService.getCrew(this.mission().id)
      this.crew.set(crewData)

      console.log('Operational sync:', {
        missionId: this.mission().id,
        crewMembers: crewData.map(m => m.display_name),
        isMember: this.isMember(),
        isChief: this.isChief()
      })

      // Load Intel
      await this.loadIntel()

    } catch (error) {
      console.error("Failed to refresh mission", error)
    }
  }

  async joinMission(mission: Mission) {
    if (mission.has_password) {
      const ref = this._dialog.open(PasswordPromptDialog)
      ref.afterClosed().subscribe(async (password: string | undefined) => {
        if (password) {
          await this.processJoin(mission.id, password)
        }
      })
    } else {
      await this.processJoin(mission.id)
    }
  }

  private async processJoin(missionId: number, password?: string) {
    try {
      await this._missionService.join(missionId, password)
      await this.refreshMission()
    } catch (error: any) {
      console.log("Failed to Join mission", error)
      const errorMsg = error.error || error.message || 'Failed to join mission'
      if (errorMsg.includes('Invalid password')) {
        alert('Incorrect password. Please try again.')
      } else {
        alert('Failed to join mission. (Ensure you are not the chief and the mission is open)')
      }
    }
  }

  async leaveMission(mission: Mission) {
    try {
      await this._missionService.leave(mission.id)
      await this.refreshMission()
    } catch (error: any) {
      console.log("Failed to Leave mission", error)
      alert(error.error || 'Failed to leave mission. (Check mission status)')
    }
  }

  async failedMission(mission: Mission) {
    try {
      await this._missionService.fail(mission.id)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to fail mission", error)
      alert('Operation failed.')
    }
  }

  async completedMission(mission: Mission) {
    try {
      await this._missionService.complete(mission.id)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to complete mission", error)
      alert('Operation failed.')
    }
  }

  async startMission(mission: Mission) {
    try {
      await this._missionService.start(mission.id)
      await this.refreshMission()
    } catch (error) {
      console.log("Failed to Start mission", error)
      alert('Mission failed to start. (Ensure it has at least one crew member)')
    }
  }

  async deleteMission(mission: Mission) {
    if (confirm('Are you sure you want to delete this mission?')) {
      try {
        await this._missionService.delete(mission)
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
          await this._missionService.edit(mission.id, editData)

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
