import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-search-mission',
    standalone: true,
    imports: [MatDialogModule, FormsModule, MatIconModule],
    templateUrl: './search-mission.html',
})
export class SearchMissionDialog {
    private _dialogRef = inject(MatDialogRef<SearchMissionDialog>);
    private _data = inject<{ name: string }>(MAT_DIALOG_DATA);

    searchTerm = signal<string>(this._data?.name || '');

    search() {
        this._dialogRef.close(this.searchTerm());
    }

    close() {
        this._dialogRef.close();
    }
}
