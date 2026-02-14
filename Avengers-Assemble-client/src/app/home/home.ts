import { Component, inject, ViewChild } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PassportService } from '../_services/passport-service'
import { FormsModule, NgForm } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { faRocket, faUserShield, faIdCard } from '@fortawesome/free-solid-svg-icons'
import emailjs from '@emailjs/browser'
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, FaIconComponent]
})
export class Home {
  private _router = inject(Router)
  private _passport = inject(PassportService)

  @ViewChild('contactFormRef') contactFormRef!: NgForm;

  // Icons
  faRocket = faRocket;
  faUserShield = faUserShield;
  faIdCard = faIdCard;

  contactForm = {
    name: '',
    email: '',
    message: ''
  }

  loading = false

  constructor() {
    if (!this._passport.data())
      this._router.navigate(['/login'])
  }

  handleClick() {
    const section = document.getElementById("About-section");
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async onSubmit() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Please fill in all fields');
      return;
    }

    this.loading = true;

    const templateParams = {
      from_name: this.contactForm.name,
      to_name: "Patiphan",
      from_email: this.contactForm.email,
      to_email: "devpatiphan@gmail.com",
      message: this.contactForm.message,
    };

    try {
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        templateParams,
        environment.emailjs.publicKey
      );

      alert('Message sent successfully!');
      this.contactFormRef.resetForm();
      this.contactForm = { name: '', email: '', message: '' };
    } catch (error) {
      console.error('FAILED...', error);
      alert('Something went wrong. Please check your configuration or try again later.');
    } finally {
      this.loading = false;
    }
  }
}
