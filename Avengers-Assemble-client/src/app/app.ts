import { Component, signal, inject } from '@angular/core'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { Navbar } from "./navbar/navbar"
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, FontAwesomeModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');
  showNavbar = signal(true);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects === '/login') {
        this.showNavbar.set(false);
      }else{
        this.showNavbar.set(true);
      }
      if (event.urlAfterRedirects === '/not-found') {
        this.showNavbar.set(false);
      }
      if (event.urlAfterRedirects === '/server-error') {
        this.showNavbar.set(false);
      }
    });
  }
}

