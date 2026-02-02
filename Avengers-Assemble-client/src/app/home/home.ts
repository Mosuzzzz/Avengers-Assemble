import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { PassportService } from '../_services/passport-service'
import { AlertService } from '../_services/alert-service'
import { GlobalAlert } from '../_models/alert'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-home',
  imports: [DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private _router = inject(Router)
  private _passport = inject(PassportService)
  private _alert = inject(AlertService)

  alerts: GlobalAlert[] = []

  async ngOnInit() {
    this.alerts = await this._alert.getActiveAlerts()
  }

  constructor() {
    if (!this._passport.data())
      this._router.navigate(['/login'])
  }

  handleClick() {
    const section = document.getElementById("About-section");
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // private _http = inject(HttpClient)
  // makeError(code: number) {
  //   const url = environment.baseUrl + '/api/util/make-error/' + code
  //   this._http.get(url).subscribe({
  //     error: e => console.log(e)
  //   })
  // }
}
