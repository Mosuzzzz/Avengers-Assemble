import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'

@Component({
  selector: 'app-server-error',
  imports: [],
  templateUrl: './server-error.html',
  styleUrl: './server-error.scss',
})
export class ServerError {
  private _router = inject(Router)
  private _location = inject(Location)
  errorMsg: string | undefined | null = undefined

  constructor() {
    this.errorMsg = this._router.currentNavigation()?.extras.state?.['error'] as string
  }

  goBack(): void {
    this._location.back()
  }
}
