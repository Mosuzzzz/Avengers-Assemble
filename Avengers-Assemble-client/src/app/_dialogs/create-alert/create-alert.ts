import { Component, inject } from '@angular/core'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { GlobalAlert } from '../../_models/alert'

@Component({
    selector: 'app-create-alert',
    imports: [MatDialogModule, FormsModule, MatIconModule],
    templateUrl: './create-alert.html',
    styleUrl: './create-alert.scss',
})
export class CreateAlertDialog {
    alert: Partial<GlobalAlert> = {
        title: '',
        content: '',
        level: 'God Level'
    }

    private readonly _dialogRef = inject(MatDialogRef<CreateAlertDialog>)

    onSubmit() {
        if (this.alert.title && this.alert.content) {
            this._dialogRef.close(this.alert)
        }
    }
}
