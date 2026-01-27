import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { SpinnerComponent } from './spinner/spinner.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Avengers-Assembleclient');
}
