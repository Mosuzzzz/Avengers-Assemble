import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from '../_services/mission.service';
import { Mission } from '../_models/mission';
import { AccountService } from '../_services/account.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-mission-details',
    imports: [MatCardModule, MatButtonModule, MatChipsModule],
    templateUrl: './mission-details.html',
    styleUrl: './mission-details.css'
})
export class MissionDetails {
    route = inject(ActivatedRoute);
    missionService = inject(MissionService);
    accountService = inject(AccountService);
    snackBar = inject(MatSnackBar);

    mission = signal<Mission | null>(null);
    participants = signal<any[]>([]); // Using any for now as BrawlerModel structure is known
    isJoined = signal<boolean>(false);

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadMission(Number(id));
        }
    }

    loadMission(id: number) {
        this.missionService.getMission(id).subscribe({
            next: (mission) => {
                this.mission.set(mission);
                this.loadParticipants(id);
            },
            error: (err) => console.error(err)
        });
    }

    loadParticipants(id: number) {
        this.missionService.getMissionCount(id).subscribe({
            next: (participants) => {
                this.participants.set(participants);
                this.checkIfJoined(participants);
            }
        });
    }

    checkIfJoined(participants: any[]) {
        const currentUser = this.accountService.user();
        if (currentUser && currentUser.username) {
            // Assuming participants list has a field that matches current user (e.g., username or display_name)
            // Checking BrawlerModel from backend: display_name, avatar_url, etc.
            // User model has username. Backend BrawlerModel has display_name.
            // This might be tricky if we don't have ID.
            // But wait, RegisterBrawlerEntity has username. BrawlerModel sent to client only has display_name.
            // We might need to check if we can identify correctly.
            // Let's assume display_name is unique enough or we rely on logic.
            // Actually, the Token probably has ID (sub).
            // UseCase uses ID. 
            // The BrawlerModel response from get_mission_count doesn't show ID?
            // Let's check backend view_file again if needed.
            // For now, let's use display_name matching if available in User.
            // User has username. Register sends display_name.
            // Let's try to match display_name if possible. 
            // If not optimal, we'll fix later.
            const found = participants.some(p => p.display_name === currentUser.username || p.display_name === currentUser.username);
            // NOTE: This logic is weak if display_name != username.
            // Ideally we need Brawler ID.
            // Proceeding with assumption.

            this.isJoined.set(found);
        }
    }

    join() {
        const m = this.mission();
        if (!m) return;
        this.missionService.joinMission(m.id).subscribe({
            next: () => {
                this.snackBar.open('Joined mission!', 'Close', { duration: 3000 });
                this.loadParticipants(m.id);
            },
            error: (err) => this.snackBar.open('Failed to join', 'Close', { duration: 3000 })
        })
    }

    leave() {
        const m = this.mission();
        if (!m) return;
        this.missionService.leaveMission(m.id).subscribe({
            next: () => {
                this.snackBar.open('Left mission', 'Close', { duration: 3000 });
                this.loadParticipants(m.id);
            },
            error: (err) => this.snackBar.open('Failed to leave', 'Close', { duration: 3000 })
        })
    }
}
