import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    router = inject(Router);
    missionService = inject(MissionService);
    accountService = inject(AccountService);
    snackBar = inject(MatSnackBar);

    mission = signal<Mission | null>(null);
    participants = signal<any[]>([]); // Using any for now as BrawlerModel structure is known
    isJoined = signal<boolean>(false);
    isChief = signal<boolean>(false);

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
                this.isChief.set(mission.chief_username === this.accountService.user()?.username);
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
            const found = participants.some(p => p.username === currentUser.username);
            this.isJoined.set(found);
            // Also re-verify isChief just in case
            if (this.mission()) {
                // mission.chief_name logic is already in loadMission, but we can double check or rely on it.
                // Actually chief_name comes from mission detail.
            }
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

    deleteMission() {
        const m = this.mission();
        if (!m) return;
        if (confirm("Are you sure you want to delete this mission?")) {
            this.missionService.deleteMission(m.id).subscribe({
                next: () => {
                    this.snackBar.open('Mission deleted', 'Close', { duration: 3000 });
                    this.router.navigate(['/']);
                },
                error: (err) => this.snackBar.open('Failed to delete mission', 'Close', { duration: 3000 })
            })
        }
    }

    startMission() {
        const m = this.mission();
        if (!m) return;
        this.missionService.startMission(m.id).subscribe({
            next: () => {
                this.snackBar.open('Mission started!', 'Close', { duration: 3000 });
                this.loadMission(m.id);
            },
            error: (err) => this.snackBar.open('Failed to start mission: ' + err.error, 'Close', { duration: 3000 })
        })
    }

    completeMission() {
        const m = this.mission();
        if (!m) return;
        this.missionService.completeMission(m.id).subscribe({
            next: () => {
                this.snackBar.open('Mission completed!', 'Close', { duration: 3000 });
                this.loadMission(m.id);
            },
            error: (err) => this.snackBar.open('Failed to complete mission', 'Close', { duration: 3000 })
        })
    }

    failMission() {
        const m = this.mission();
        if (!m) return;
        this.missionService.failMission(m.id).subscribe({
            next: () => {
                this.snackBar.open('Mission marked as failed', 'Close', { duration: 3000 });
                this.loadMission(m.id);
            },
            error: (err) => this.snackBar.open('Failed to update mission', 'Close', { duration: 3000 })
        })
    }
}
