import { Component, inject } from '@angular/core'
import { AddMission } from '../../_models/add-mission'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-new-mission',
  imports: [MatDialogModule, MatButtonModule, FormsModule, MatIconModule],
  templateUrl: './new-mission.html',
  styleUrl: './new-mission.scss',
})
export class NewMission {
  addMission: AddMission = {
    name: '',
    description: ''
  }
  private readonly _dialogRef = inject(MatDialogRef<NewMission>)

  onSubmit() {
    const mission = this.clean(this.addMission)
    this._dialogRef.close(mission)
  }

  private clean(addMission: AddMission): AddMission {
    return {
      name: addMission.name.trim() || 'untitled',
      description: addMission.description?.trim() || undefined,
      password: addMission.password?.trim() || undefined,
      max_crew: addMission.max_crew
    }
  }
}
