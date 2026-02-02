import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Brawler } from '../_models/brawler';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BrawlerService {
    private _base_url = environment.baseUrl + '/api/brawler';
    private _http = inject(HttpClient);

    async getProfile(): Promise<Brawler> {
        const url = `${this._base_url}/profile`;
        return await firstValueFrom(this._http.get<Brawler>(url));
    }
}
