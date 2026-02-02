import { Component, computed, inject, Signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { PassportService } from '../_services/passport-service'
import { MatMenuModule } from '@angular/material/menu'
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { faCircle } from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private _router = inject(Router)
  private _passport = inject(PassportService)

  isDropdownActive = false
  fabar = faBars;
  fadot = faCircle;


  logout() {
    this._passport.destroy()

    this._router.navigate(['/login'])
  }

  toggleDropdown() {
    this.isDropdownActive = !this.isDropdownActive;
  }
  toggleDropdownoff() {
    this.isDropdownActive = false;
  }


}
