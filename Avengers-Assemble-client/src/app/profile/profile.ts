import { Component, computed, inject, Signal } from '@angular/core';
import { PassportService } from '../_services/passport-service';
import { getAvatarUrl } from '../_helpers/util';
import { UploadImg } from '../_dialogs/upload-img/upload-img';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../_services/user-service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  avatar_url: Signal<string>
  private _dialog = inject(MatDialog)
  private _passport = inject(PassportService)
  private _user = inject(UserService)
  constructor(){
    this.avatar_url = computed(() => getAvatarUrl(this._passport.data()))
  }
  openDialog(){
    const ref = this._dialog.open(UploadImg)
    ref.afterClosed().subscribe(async file => {
      if (file) {
       const error = await this._user.uploadAvatarImg(file)
       if(error){
        console.log(error)
       }
      }
    })
  }
}

