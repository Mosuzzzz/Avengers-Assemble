import { inject, Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { MissionFilter } from '../_models/mission-filter'
import { first, firstValueFrom } from 'rxjs'
import { Mission } from '../_models/mission'
import { AddMission } from '../_models/add-mission'
import { EditMission } from '../_models/edit-mission'

import { MissionIntel, AddIntel } from '../_models/intel'

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  ///view
  private _base_url = environment.baseUrl + '/api'
  private _http = inject(HttpClient)

  async getIntel(mission_id: number): Promise<MissionIntel[]> {
    const url = `${this._base_url}/intel/${mission_id}`
    return await firstValueFrom(this._http.get<MissionIntel[]>(url))
  }

  async addIntel(mission_id: number, intel: AddIntel): Promise<number> {
    const url = `${this._base_url}/intel/${mission_id}`
    const resp = await firstValueFrom(this._http.post<{ id: number }>(url, intel))
    return resp.id || Number(resp) // Backend might return raw ID or JSON
  }

  filter: MissionFilter = {}

  async getOne(mission_id: number): Promise<Mission> {
    const url = this._base_url + '/view/' + mission_id
    const mission = await firstValueFrom(this._http.get<Mission>(url))
    return mission
  }

  async getCrew(mission_id: number): Promise<any[]> {
    const url = this._base_url + '/view/crew/' + mission_id
    return await firstValueFrom(this._http.get<any[]>(url))
  }

  async getByFilter(filter: MissionFilter): Promise<Mission[]> {
    const queryString = this.createQueryString(filter)
    const url = this._base_url + '/view/filter?' + queryString
    const missions = await firstValueFrom(this._http.get<Mission[]>(url))
    return missions
  }

  private createQueryString(filter: MissionFilter): string {
    this.filter = filter
    const params: string[] = []

    if (filter.name && filter.name.trim()) {
      params.push(`name=${encodeURIComponent(filter.name.trim())}`)
    }
    if (filter.status) {
      params.push(`status=${encodeURIComponent(filter.status)}`)
    }

    return params.join("&")
  }

  async add(mission: AddMission): Promise<number> {
    const url = this._base_url + '/mission-management'
    const observable = this._http.post<{ mission_id: number }>(url, mission)
    const resp = await firstValueFrom(observable)
    return resp.mission_id
  }

  async getMyMissions(): Promise<Mission[]> {
    const url = this._base_url + '/brawler/my-missions'
    const observable = this._http.get<Mission[]>(url)
    const missions = await firstValueFrom(observable)
    return missions
  }

  async delete(mission: Mission): Promise<void> {
    const url = `${this._base_url}/mission-management/${mission.id}`
    const observable = this._http.delete(url, { responseType: 'text' })
    await firstValueFrom(observable)
  }

  async edit(mission_id: number, editData: EditMission): Promise<void> {
    const url = `${this._base_url}/mission-management/${mission_id}`
    const observable = this._http.patch(url, editData, { responseType: 'text' })
    await firstValueFrom(observable)
  }

  async start(mission_id: number): Promise<void> {
    const url = `${this._base_url}/mission/in-progress/${mission_id}`
    const observable = this._http.patch(url, {}, { responseType: 'text' })
    await firstValueFrom(observable)
  }
  async complete(mission_id: number): Promise<void> {
    const url = `${this._base_url}/mission/to-completed/${mission_id}`
    const observable = this._http.patch(url, {}, { responseType: 'text' })
    await firstValueFrom(observable)
  }
  async fail(mission_id: number): Promise<void> {
    const url = `${this._base_url}/mission/to-failed/${mission_id}`
    const observable = this._http.patch(url, {}, { responseType: 'text' })
    await firstValueFrom(observable)
  }

  async join(mission_id: number) {
    const url = `${this._base_url}/crew/join/${mission_id}`
    const observable = this._http.post(url, {}, { responseType: 'text' })
    await firstValueFrom(observable)
  }

  async leave(mission_id: number) {
    const url = `${this._base_url}/crew/leave/${mission_id}`
    const observable = this._http.delete(url, { responseType: 'text' })
    await firstValueFrom(observable)
  }
}
