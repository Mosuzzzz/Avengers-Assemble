import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { PassportService } from '../_services/passport-service'


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private _router = inject(Router)
  private _passport = inject(PassportService)

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


