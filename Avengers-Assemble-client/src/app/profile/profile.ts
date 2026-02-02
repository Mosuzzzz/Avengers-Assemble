import { Component, computed, inject, signal, Signal } from '@angular/core'
import { PassportService } from '../_services/passport-service'
import { UserService } from '../_services/user-service'
import { fileTypeFromBlob } from 'file-type'
import { MatButtonModule } from '@angular/material/button'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'


@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  avatar_url: Signal<string>
  display_name: Signal<string | undefined>
  private _passport = inject(PassportService)
  private _user = inject(UserService)
  acceptedMimeType = ['image/jpeg', 'image/png']
  imgFile: File | undefined
  imgPreview = signal<string | undefined>(undefined)
  errorMsg = signal<string | undefined>(undefined)

  form: FormGroup
 
  profileForm = new FormGroup({
    display_name: new FormControl(''),
  })


  constructor() {
    this.display_name = computed(() => this._passport.data()?.display_name)
    this.avatar_url = computed(() => this._passport.avatar())
    this.form = new FormGroup({})
  }

  async onSubmit() {
    if (this.imgFile) {
      const error = await this._user.uploadAvatarImg(this.imgFile)
      if (error) {
        this.errorMsg.set(error)
        return
      } else {
        this.imgFile = undefined
        this.imgPreview.set(undefined)
      }
    }

    const { display_name } = this.profileForm.value
    if (display_name && display_name !== this.display_name()) {
      const error = await this._user.updateDisplayName(display_name)
      if (error) {
        this.errorMsg.set(error)
      } else {
        this.profileForm.get('display_name')?.reset()
      }
    }
  }

  async onImgPicked(event: Event) {
    this.imgFile = undefined
    this.imgPreview.set(undefined)
    this.errorMsg.set(undefined)

    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.imgFile = input.files[0]
      const fileType = await fileTypeFromBlob(this.imgFile)
      if (fileType && this.acceptedMimeType.includes(fileType.mime)) {
        const reader = new FileReader()
        reader.onerror = () => {
          this.imgFile = undefined
          this.errorMsg.set("some thing went wrong")
        }
        reader.onload = () => {
          this.imgPreview.set(reader.result as string)
        }
        reader.readAsDataURL(this.imgFile)
      } else {
        this.imgFile = undefined
        this.errorMsg.set("image file must be .jpg or .png")
      }
    }
  }


}
