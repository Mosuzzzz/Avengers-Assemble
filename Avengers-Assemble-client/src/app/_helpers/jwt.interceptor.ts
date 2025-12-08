import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../_services/account.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const accountService = inject(AccountService);
    const user = accountService.user();

    if (user && user.access_token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${user.access_token}`
            }
        });
    }

    return next(req);
};
