import { Component, inject, OnInit } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PassportService } from '../_services/passport-service'
import { AlertService } from '../_services/alert-service'
import { GlobalAlert } from '../_models/alert'
import { DatePipe } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatDialog } from '@angular/material/dialog'
import { CreateAlertDialog } from '../_dialogs/create-alert/create-alert'

@Component({
  selector: 'app-home',
  imports: [DatePipe, RouterLink, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private _router = inject(Router)
  private _passport = inject(PassportService)
  private _alert = inject(AlertService)
  private _dialog = inject(MatDialog)

  alerts: GlobalAlert[] = []

  async ngOnInit() {
    this.alerts = await this._alert.getActiveAlerts()
  }

  constructor() {
    if (!this._passport.data())
      this._router.navigate(['/login'])
  }

  async openCreateAlertDialog() {
    const ref = this._dialog.open(CreateAlertDialog)
    ref.afterClosed().subscribe(async (newAlert: Partial<GlobalAlert>) => {
      if (newAlert) {
        await this._alert.createAlert(newAlert)
        this.alerts = await this._alert.getActiveAlerts()
      }
    })
  }

  handleClick() {
    const section = document.getElementById("About-section");
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
