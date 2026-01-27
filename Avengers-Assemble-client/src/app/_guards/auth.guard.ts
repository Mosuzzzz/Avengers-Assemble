import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (accountService.user()) {
    return true;
  }

  snackBar.open('You shall not pass!', 'OK', { duration: 3000 });
  router.navigate(['/login']);
  return false;
};
