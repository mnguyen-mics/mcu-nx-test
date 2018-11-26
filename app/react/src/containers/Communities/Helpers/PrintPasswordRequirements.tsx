import { CommunityPasswordRequirement, CommunityPasswordValidity } from '../../../models/communities';
import React from 'react'
import McsIcon from  '../../../components/McsIcon';


import { defineMessages } from 'react-intl';

const messages = defineMessages({
    passwordMatch: {
      id: 'check.passwords.match',
      defaultMessage: 'Both passwords should match',
    },
    passwordMustContain: {
      id: 'check.passwords.must.contain',
      defaultMessage: 'Your password must match the following requirements :',
    },
    characters: {
      id: 'check.passwords.characters',
      defaultMessage: 'characters minimum',
    },
    digits: {
      id: 'check.passwords.digits',
      defaultMessage: 'digit(s) minimum',
    },
    specialCharacters: {
      id: 'check.passwords.special.characters',
      defaultMessage: 'special character(s) minimum',
    },
    easyPasswords: {
        id: 'check.passwords.easy.passwords',
        defaultMessage: 'Passwords cannot be easy',
      },
    lowerAndUpperCase: {
      id: 'check.passwords.lower.upper',
      defaultMessage:
        'One lowercase and one uppercase character',
    }
  });

function checkOrWarning(selector: boolean) {
    return (<span>{selector ? <McsIcon type="check" className="check-logo"/> : <McsIcon type="warning" className="warning-logo"/> }</span>)         
}

export function printPasswordRequirements(req: CommunityPasswordRequirement, val?: CommunityPasswordValidity) { 
    return (
            <ul>
                <li>{messages.passwordMustContain.defaultMessage}</li>
                <ul>
                    {req.min_length > 0 ? <li className="requirement-list">{val ? checkOrWarning(val.is_long_enough) : '-'} {req.min_length} {messages.characters.defaultMessage}</li> : '' }
                    {req.min_digit_count > 0 ? <li className="requirement-list">{val ? checkOrWarning(val.has_enough_digits) : '-'} {req.min_digit_count} {messages.digits.defaultMessage}</li> : '' }
                    {req.min_special_chars_count > 0 ? <li className="requirement-list">{val ? checkOrWarning(val.has_enough_special_chars) : '-'} {req.min_special_chars_count} {messages.specialCharacters.defaultMessage}</li> : '' }
                </ul>
                {req.different_letter_case_needed ? <li className="requirement-list">{val ? checkOrWarning(val.has_upper_and_lower_cases) : '-'} {messages.lowerAndUpperCase.defaultMessage}</li> : '' }
                {req.forbid_popular_passwords ? <li className="requirement-list">{val ? checkOrWarning(val.is_not_popular) : '-'} {messages.easyPasswords.defaultMessage}</li> : '' }
            </ul>
    )
}

export function printPasswordMatching(password1?: string, password2?: string) {
    return (
        <ul>
            <li className="requirement-list">{(password2 === undefined) ? '-' : checkOrWarning((password1 === password2)) } {messages.passwordMatch.defaultMessage}</li>
        </ul>
    )
}

export function globalValidity(val?: CommunityPasswordValidity) {
    if (!val) {
        return false;
    } else {
        if (val.has_enough_digits === false || val.has_enough_special_chars === false || val.has_upper_and_lower_cases === false || val.is_long_enough === false || val.is_not_popular === false) {
            return false;
        } else {
            return true;
        }
    }
}