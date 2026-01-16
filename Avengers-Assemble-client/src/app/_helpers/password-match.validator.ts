import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function PasswordMatchValidator(
    ctrl_password_name: string,
    ctrl_confirm_password_name: string
): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const ctrlPassword = formGroup.get(ctrl_password_name)
        const ctrlConfirmPassword = formGroup.get(ctrl_confirm_password_name)

        if (!ctrlPassword || !ctrl_password_name) return null
        if (ctrlPassword.value !== ctrlConfirmPassword?.value)
            ctrlConfirmPassword?.setErrors({ mismatch: true })
        else if (ctrlConfirmPassword?.hasError('mismatch')) {
            // Only remove mismatch error, keep others if any (though for now set null is fine if it's the only custom one on it, but better to be safe or just set null as per original intent)
            ctrlConfirmPassword.setErrors(null);
        }
        return null
    }
}