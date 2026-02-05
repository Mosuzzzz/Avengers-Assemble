import { Component, inject } from '@angular/core'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'

@Component({
    selector: 'app-password-prompt',
    imports: [MatDialogModule, FormsModule, MatIconModule],
    templateUrl: './password-prompt.html',
    styleUrl: './password-prompt.scss',
})
export class PasswordPromptDialog {
    password = ""
    private readonly _dialogRef = inject(MatDialogRef<PasswordPromptDialog>)

    onSubmit() {
        if (this.password.trim()) {
            this._dialogRef.close(this.password.trim())
        }
    }
}
