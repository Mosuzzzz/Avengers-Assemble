import { CanActivateFn, Router } from "@angular/router";
import { PassportService } from "../_service/passport-service";
import { inject } from "@angular/core";




export const authGuard: CanActivateFn = (route, state) => {
    const passport = inject(PassportService)
    const router = inject(Router)
    if (passport.data()?.token_type ) {
        return true
    }

    router.navigate(['/not-found'])
    return false
}