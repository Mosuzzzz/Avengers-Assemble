import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatAnchor } from "@angular/material/button";
import {fileTypeFromBlob} from 'file-type'

@Component({
  selector: 'app-upload-img',
  imports: [MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogActions, MatAnchor],
  templateUrl: './upload-img.html',
  styleUrl: './upload-img.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadImg {
  acceptedMimeType = ['image/jpeg','image/png']
  imgFile: File |undefined
  imgPreview = signal<string | undefined>(undefined)
  errorMsg = signal<string | undefined>(undefined)
  private readonly _dialogRef = inject(MatDialogRef<UploadImg>)

  onSubmit() {
    this._dialogRef.close(this.imgFile)
  }
  async onImagePicked(event:Event){
    this.imgFile = undefined
    this.imgPreview.set(undefined)
    this.errorMsg.set(undefined)

    const input = event.target as HTMLInputElement
    if(input.files && input.files.length > 0){
      this.imgFile = input.files[0]
      const fileType = await fileTypeFromBlob(this.imgFile)
      if(fileType && this.acceptedMimeType.includes(fileType.mime)){
        const reader = new FileReader()

        reader.onerror = () => {
          this.imgFile = undefined
          this.errorMsg.set("Something went wrong")
        }
        reader.onload = () => {
          this.imgPreview.set(reader.result as string)
        }
        reader.readAsDataURL(this.imgFile)
      }else{
        this.imgFile = undefined
        this.errorMsg.set("img file must be .jpg or .png")
      }
    }
  }
}
