import { inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  private _snackBarConfig: MatSnackBarConfig = {
    horizontalPosition: 'right',
    verticalPosition: 'top',
    duration: 5000,
    panelClass: ['snack-bar-error']
  };

  handleError(error: any): Observable<never> {
    if (error) {
      console.error('An error occurred:', error);

      switch (error.status) {
        case 400:
          const message = error.error?.message || (typeof error.error === 'string' ? error.error : 'Bad Request');
          this._snackBar.open(message, 'OK', this._snackBarConfig);
          break;

        case 401:
          this._snackBar.open('Unauthorized access', 'OK', this._snackBarConfig);
          // Optional: redirect to login if not handled by a guard
          // this._router.navigate(['/login']);
          break;

        case 403:
          this._snackBar.open('Forbidden action', 'OK', this._snackBarConfig);
          break;

        case 404:
          this._snackBar.open('Resource not found', 'OK', this._snackBarConfig);
          break;

        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 505:
        case 506:
        case 507:
        case 508:
        case 509:
        case 510:
        case 511:
          const navExtra: NavigationExtras = {
            state: { error: error.error }
          };
          this._router.navigate(['server-error'], navExtra);
          break;

        default:
          this._snackBar.open('Something went wrong! Please try again later.', 'OK', this._snackBarConfig);
          break;
      }
    }

    // Always rethrow the error so subscribing components can react if needed
    return throwError(() => error);
  }
}
