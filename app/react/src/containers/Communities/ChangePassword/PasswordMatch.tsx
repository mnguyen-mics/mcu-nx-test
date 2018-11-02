// import { CommunityPasswordRequirement } from '../../../models/communities';
import CommunityService from '../../../services/CommunityServices';

export function checkPasswordValidity(communityToken: string, password1: string, password2: string) {
        const passwordRequirements =  CommunityService.getCommunity(communityToken).then(response => {
            return response.data[1];
        });
        
        // const upperAndLowerCases = (/[A-Z]/gm).test(password1) && (/[a-z]/gm).test(password1);
        // const specialCharsTab = password1.match(/[@#$%^&*()!_+\-=\[\]{};':"\\|,.<>\/?]/g);
        // const specialCharsNb = specialCharsTab ? specialCharsTab.length : 0;

        // if (password1 == null || password2 === null) {
        //     return false;
        // } if (password1 !== password2) {
        //     return false;
        // } if (password1.length < passwordRequirements.min_length)
    }
}

export default checkPasswordValidity;