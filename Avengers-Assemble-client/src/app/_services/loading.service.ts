import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal<boolean>(false);

  loading() {
    this.isLoading.set(true);
  }

  idle() {
    this.isLoading.set(false);
  }
}
