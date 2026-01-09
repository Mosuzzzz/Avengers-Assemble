import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Passport } from '../_models/passport';
import { LoginData, RegisterData } from '../_models/brawler';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PassportService {
  private _key = 'passport'
  private base_url = environment + '/api'
  private _http = inject(HttpClient)

  data = signal<undefined | Passport>(undefined)

  constructor() {
    this.loadPasspostFromLocalStorage
  }

  private loadPasspostFromLocalStorage(): string | null {
    const jsonString = localStorage.getItem(this._key)
    if (!jsonString) return 'not found'
    try {
      const passport = JSON.parse(jsonString) as Passport
      this.data.set(passport)
    } catch (error) {
      return `${error}`
    }

    return null
  }

  private savePassportToLocalStorage() {
    const passport = this.data()
    if (!passport) return
    const jsonString = JSON.stringify(passport)
    localStorage.setItem(this._key, jsonString)
  }

  async get(login: LoginData): Promise<null | string> {
    try {
      const api_url = this.base_url + '/authentication/login'
      await this.fetchPassport(login, api_url)
    } catch (error) {
      return `${error}`
    }
    return null
  }
  async register(register:LoginData | RegisterData): Promise<null | string> {
    try {
      const api_url = this.base_url + 'brawlers/register'
      await this.fetchPassport(register, api_url)
    } catch (error) {
      return `${error}`
    }
    return null
  }
  private async fetchPassport(register: LoginData | RegisterData, api_url: string) {
      const result = this._http.post<Passport>(api_url, register)
      const passport: Passport = await firstValueFrom(result)
      this.data.set(passport)
      this.savePassportToLocalStorage()
  }


}
