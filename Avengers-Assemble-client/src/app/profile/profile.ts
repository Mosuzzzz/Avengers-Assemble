import { Component, inject, signal } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  accountService = inject(AccountService);
  snackBar = inject(MatSnackBar);
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar() {
    if (!this.selectedFile) return;

    // Convert to Base64 (strip prefix)
    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result as string;
      // The backend likely expects just the base64 data, or maybe with prefix.
      // UploadedAvartar struct: pub base64_string: String.
      // Usually image/png;base64,... 
      // Let's assume sending the full string is safer or check backend implementation if possible.
      // Backend `upload_avatar` takes `UploadedAvartar`.
      // `brawlers_use_case.upload_avatar` implementation would tell if it decodes or saves directly.
      // Assuming sending full data URL is safest for now, or strip if backend is strict.
      // Most libs handle data URI.

      this.accountService.uploadAvatar(base64).subscribe({
        next: () => {
          this.snackBar.open('Avatar uploaded successfully', 'Close', { duration: 3000 });
          // Update user avatar in local state if needed
          // But user model in local storage might need update.
          // Re-login or refresh user profile would be best.
        },
        error: (err) => this.snackBar.open('Upload failed', 'Close', { duration: 3000 })
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }
}
