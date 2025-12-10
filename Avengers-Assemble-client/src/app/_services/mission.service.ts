import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Mission, MissionFilter } from '../_models/mission';
import { map, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MissionService {
    private http = inject(HttpClient);
    baseUrl = '/api/view';

    getMissions(filter: MissionFilter = {}) {
        let params = new HttpParams();
        if (filter.status) params = params.append('status', filter.status);
        if (filter.name) params = params.append('name', filter.name);

        return this.http.get<Mission[]>(this.baseUrl + '/gets', { params });
    }

    getMission(id: number) {
        return this.http.get<Mission>(this.baseUrl + '/' + id);
    }

    getMissionCount(id: number) {
        return this.http.get<any>(this.baseUrl + '/count/' + id);
    }

    joinMission(id: number) {
        return this.http.post(`/api/crew/join/${id}`, {}, { responseType: 'text' });
    }

    leaveMission(id: number) {
        return this.http.delete(`/api/crew/leave/${id}`, { responseType: 'text' });
    }

    createMission(mission: { name: string, description: string }) {
        return this.http.post('/api/mission-management/create', mission);
    }

    deleteMission(id: number) {
        return this.http.delete(`/api/mission-management/remove/${id}`, { responseType: 'text' });
    }

    startMission(id: number) {
        return this.http.patch(`/api/mission/in-progress/${id}`, {}, { responseType: 'text' });
    }

    completeMission(id: number) {
        return this.http.patch(`/api/mission/to-completed/${id}`, {}, { responseType: 'text' });
    }

    failMission(id: number) {
        return this.http.patch(`/api/mission/to-failed/${id}`, {}, { responseType: 'text' });
    }
}
