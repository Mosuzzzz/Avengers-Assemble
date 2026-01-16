import { Component, computed, inject, Signal } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButton } from "@angular/material/button"
import { PassportService } from '../_service/passport-service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { getAvatarUrl } from '../_helpers/util';
import { Router, RouterLink } from "@angular/router";



@Component({
  selector: 'app-navbar',
  imports: [
    MatSlideToggleModule,
    MatToolbarModule,
    MatButton,
    MatButtonModule,
    MatMenuModule,
    RouterLink
],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private _passport = inject(PassportService)

  display_name: Signal<string | undefined>
  avatar_url: Signal<string | undefined>
  private _router = inject(Router)


  constructor() {
    this.display_name = computed(() => this._passport.data()?.display_name)
    this.avatar_url = computed(() => getAvatarUrl(this._passport.data()))
  }


  logout() {
    this._passport.destroy()
    this._router.navigate(['/login'])
  }
}
