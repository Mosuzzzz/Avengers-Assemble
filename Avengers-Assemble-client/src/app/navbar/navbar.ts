import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButton } from "@angular/material/button"
import { AccountService } from '../_services/account.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    MatSlideToggleModule,
    MatToolbarModule,
    MatButton,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  accountService = inject(AccountService);

  logout() {
    this.accountService.logout();
  }
}
