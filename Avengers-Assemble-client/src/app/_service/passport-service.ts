import { HttpClient } from "@angular/common/http"
import { environment } from "../../environments/environment.development"
import { inject, Injectable, signal, PLATFORM_ID } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { Passport } from "../_models/passport"
import { LoginData, RegisterData } from "../_models/brawler"
import { isPlatformBrowser } from "@angular/common"

@Injectable({
  providedIn: 'root'
})
export class PassportService {
  private _key = 'passport'
  private _base_url = environment.baseUrl + '/api'

  private _http = inject(HttpClient)
  private _platformId = inject(PLATFORM_ID)

  data = signal<Passport | undefined>(undefined)

  constructor() {
    // ✅ รันเฉพาะฝั่ง Browser
    if (isPlatformBrowser(this._platformId)) {
      this.loadPassportFormLocalStorage()
    }
  }

  private loadPassportFormLocalStorage(): null | string {
    try {
      const jsonString = localStorage.getItem(this._key)
      if (!jsonString) return 'notfound'

      const passport = JSON.parse(jsonString) as Passport
      this.data.set(passport)
      return null
    } catch (error) {
      return `${error}`
    }
  }

  private savePassportToLocalStorage() {
    if (!isPlatformBrowser(this._platformId)) return

    const passport = this.data()
    if (!passport) return

    localStorage.setItem(this._key, JSON.stringify(passport))
  }

  async get(login: LoginData): Promise<null | string> {
    try {
      const api_url = this._base_url + '/authentication/login'
      await this.fetchPassport(api_url, login)
      return null
    } catch (error) {
      return `${error}`
    }
  }

  async register(model: RegisterData): Promise<null | string> {
    try {
      const api_url = this._base_url + '/brawlers/register'
      await this.fetchPassport(api_url, model)
      return null
    } catch (error) {
      return `${error}`
    }
  }

  private async fetchPassport(api_url: string, model: LoginData | RegisterData) {
    const result$ = this._http.post<Passport>(api_url, model)
    const passport = await firstValueFrom(result$)

    this.data.set(passport)
    this.savePassportToLocalStorage()
  }
}
