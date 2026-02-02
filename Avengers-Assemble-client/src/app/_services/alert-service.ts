import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GlobalAlert } from '../_models/alert';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private _base_url = environment.baseUrl + '/api/alerts';
    private _http = inject(HttpClient);

    async getActiveAlerts(): Promise<GlobalAlert[]> {
        return await firstValueFrom(this._http.get<GlobalAlert[]>(this._base_url));
    }

    async createAlert(alert: Partial<GlobalAlert>): Promise<number> {
        const resp = await firstValueFrom(this._http.post<{ id: number }>(this._base_url, alert));
        return resp.id;
    }
}
