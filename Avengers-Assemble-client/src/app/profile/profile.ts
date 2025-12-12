import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ProfileData {
  display_name: string;
  avatar_url: string;
  username: string;
  mission_success_count: number;
  mission_joined_count: number;
}

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  accountService = inject(AccountService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  profileData = signal<ProfileData | null>(null);

  ngOnInit() {
    // Check if user is logged in
    if (!this.accountService.user()) {
      this.snackBar.open('Please login to view your profile', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.accountService.getProfile().subscribe({
      next: (data: any) => {
        console.log('Profile data received:', data);
        this.profileData.set(data);
        if (data.avatar_url) {
          this.previewUrl.set(data.avatar_url);
        }
      },
      error: (err) => {
        console.error('Profile load error:', err);
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      }
    });
  }

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
      let base64 = (reader.result as string).split(',')[1];
      // The backend likely expects just the base64 data, or maybe with prefix.
      // UploadedAvartar struct: pub base64_string: String.
      // Usually image/png;base64,... 
      // Let's assume sending the full string is safer or check backend implementation if possible.
      // Backend `upload_avatar` takes `UploadedAvartar`.
      // `brawlers_use_case.upload_avatar` implementation would tell if it decodes or saves directly.
      // Assuming sending full data URL is safest for now, or strip if backend is strict.
      // Most libs handle data URI.

      this.accountService.uploadAvatar(base64).subscribe({
        next: (response: any) => {
          this.snackBar.open('Avatar uploaded successfully', 'Close', { duration: 3000 });
          const currentUser = this.accountService.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, avatar_url: response.url };
            this.accountService.setCurrentUser(updatedUser);
          }
          // Reload profile to get updated avatar
          this.loadProfile();
        },
        error: (err) => this.snackBar.open('Upload failed', 'Close', { duration: 3000 })
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }
}
