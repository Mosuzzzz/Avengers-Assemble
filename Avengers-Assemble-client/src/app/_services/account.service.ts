import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    // Assuming simple development environment url if environment file doesn't exist yet, 
    // but better to use relative path '/api' if proxy is set up or absolute if CORS allowed.
    // Given previous file views, I'll assume '/api' prefix isproxied or handled. 
    // Codebase analysis showed server on port defined in config. 
    // I will use /api relative path which is standard.
    baseUrl = '/api';

    user = signal<User | null>(null);

    constructor() {
        // Check local storage on init if browser
        if (isPlatformBrowser(this.platformId)) {
            const userString = localStorage.getItem('user');
            if (userString) {
                this.user.set(JSON.parse(userString));
            }
        }
    }

    login(model: any) {
        return this.http.post<User>(this.baseUrl + '/authentication/login', model).pipe(
            map(user => {
                if (user) {
                    user.username = model.username;
                    this.setCurrentUser(user);
                }
                return user;
            })
        );
    }

    register(model: any) {
        return this.http.post<User>(this.baseUrl + '/brawlers/register', model).pipe(
            map(user => {
                if (user) {
                    user.username = model.username;
                    this.setCurrentUser(user);
                }
                return user;
            })
        );
    }

    setCurrentUser(user: User) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        this.user.set(user);
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('user');
        }
        this.user.set(null);
    }

    uploadAvatar(base64: string) {
        return this.http.post(this.baseUrl + '/brawlers/avatar', { base64_string: base64 });
    }
}
