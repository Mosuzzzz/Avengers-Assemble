import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MissionService } from '../_services/mission.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-create-mission-dialog',
    templateUrl: './create-mission-dialog.html',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule]
})
export class CreateMissionDialog {
    private fb = inject(FormBuilder);
    private missionService = inject(MissionService);
    private dialogRef = inject(MatDialogRef<CreateMissionDialog>);
    private snackBar = inject(MatSnackBar);

    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['']
    });

    create() {
        if (this.form.invalid) return;

        const val = this.form.value;
        const mission = {
            name: val.name!,
            description: val.description || ''
        };

        this.missionService.createMission(mission).subscribe({
            next: () => {
                this.snackBar.open('Mission created successfully', 'Close', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error(err);
                let msg = 'Failed to create mission';
                if (err.error && typeof err.error === 'string') {
                    msg = err.error;
                } else if (err.message) {
                    msg = err.message;
                }
                this.snackBar.open(msg, 'Close', { duration: 3000 });
            }
        });
    }
}
