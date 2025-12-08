import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AccountService } from '../_services/account.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const accountService = inject(AccountService);

    return next(req).pipe(
        catchError(error => {
            if (error) {
                if (error.status === 401) {
                    accountService.logout();
                } else {
                    // Handle other errors if needed, or propagate
                }
            }
            return throwError(() => error);
        })
    );
};
