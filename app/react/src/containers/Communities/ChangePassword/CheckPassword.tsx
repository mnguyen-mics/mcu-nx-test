import { CommunityPasswordRequirement } from '../../../models/communities';

export interface PasswordValidity {
    isCompliant: boolean,
    errorMessage?: string,
}

export function CheckPassword(password1: string, password2: string, passReq: CommunityPasswordRequirement): PasswordValidity {

    const passwordCheckResult: PasswordValidity = {isCompliant: false,};
           
    const upperAndLowerCases = (/[A-Z]/gm).test(password1) && (/[a-z]/gm).test(password1);
    const specialCharsTab = password1.match(/[@#$%^&*()!_+\-=\[\]{};':"\\|,.<>\/?]/g);
    const specialCharsNb = specialCharsTab ? specialCharsTab.length : 0;
    if (password1 == null || password2 === null) {
        passwordCheckResult.errorMessage ='Passwords must be defined';
    } if (password1 !== password2) {
        passwordCheckResult.errorMessage ='Both passwords should be the same';
    } if (password1.length < passReq.min_length) {
        passwordCheckResult.errorMessage =`Password must be at least ${passReq.min_length} characters long`;
    } if (specialCharsNb < passReq.min_special_chars_count) {
        passwordCheckResult.errorMessage =`Password must contain at least ${passReq.min_special_chars_count} special character${passReq.min_special_chars_count > 1 ? 's' : '' }`;
    } if (!upperAndLowerCases && passReq.different_letter_case_needed) {
        passwordCheckResult.errorMessage ='Password must contain lowercase and uppercase characters';
    } else {
        passwordCheckResult.isCompliant = true;
    }
    return passwordCheckResult;
};