import { Component, inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { Mission } from '../../_models/mission'
import { EditMission } from '../../_models/edit-mission'

@Component({
    selector: 'app-edit-mission',
    imports: [MatDialogModule, MatButtonModule, FormsModule, MatIconModule],
    templateUrl: './edit-mission.html',
    styleUrl: './edit-mission.scss',
})
export class EditMissionDialog {
    private readonly _data = inject<Mission>(MAT_DIALOG_DATA)
    private readonly _dialogRef = inject(MatDialogRef<EditMissionDialog>)

    editMission: EditMission = {
        name: this._data.name,
        description: this._data.description || ''
    }

    onSubmit() {
        const mission = this.clean(this.editMission)
        this._dialogRef.close(mission)
    }
    onclose() {
        this._dialogRef.close()
    }

    private clean(editMission: EditMission): EditMission {
        return {
            name: editMission.name?.trim() || undefined,
            description: editMission.description?.trim() || undefined
        }
    }
}
