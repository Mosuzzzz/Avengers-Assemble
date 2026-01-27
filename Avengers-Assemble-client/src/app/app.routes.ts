import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { ServerError } from './server-error/server-error';
import { NotFound } from './not-found/not-found';
import { Login } from './login/login';
import { MissionDetails } from './mission-details/mission-details';
import { guestGuard } from './_guards/guest.guard';
import { authGuard } from './_guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: 'mission/:id', component: MissionDetails, canActivate: [authGuard] },
    { path: 'server-error', component: ServerError },
    { path: '**', component: NotFound }
];
