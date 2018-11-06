import { CommunityPasswordRequirement } from '../../../models/communities';

export interface PasswordValidity {
  isCompliant: boolean;
  errorMessages: string[];
}

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  noPassword: {
    id: 'check.passwords.empty.fields',
    defaultMessage: 'A password should be entered',
  },
  noPasswordMatch: {
    id: 'check.passwords.match',
    defaultMessage: 'Both passwords are not matching',
  },
  passwordMustContain: {
    id: 'check.passwords.length',
    defaultMessage: 'Password must contain at least',
  },
  characters: {
    id: 'check.passwords.characters',
    defaultMessage: 'character(s)',
  },
  digits: {
    id: 'check.passwords.digits',
    defaultMessage: 'digit(s)',
  },
  specialCharacters: {
    id: 'check.passwords.special.characters',
    defaultMessage: 'special character(s)',
  },
  lowerAndUpperCase: {
    id: 'check.passwords.lower.upper',
    defaultMessage:
      'Password must contain lowercase and uppercase characters',
  },
});

export function checkPasswordRequirements(
  password1: string,
  password2: string,
  passReq: CommunityPasswordRequirement,
): PasswordValidity {
  
  const passwordCheckResult: PasswordValidity = {
    isCompliant: false,
    errorMessages: [],
  };

  const digitsTab = password1.match(/\d/gm);
  const numberOfDigits = digitsTab ? digitsTab.length : 0;
  const upperAndLowerCases =
    /[A-Z]/gm.test(password1) && /[a-z]/gm.test(password1);
  const specialCharsTab = password1.match(
    /[@#$%^&*()!_+\-=\[\]{};':"\\|,.<>\/?]/g,
  );
  const specialCharsNb = specialCharsTab ? specialCharsTab.length : 0;

  if (password1 == null || password2 === null) {
    passwordCheckResult.errorMessages.push(messages.noPassword.defaultMessage);
  }
  if (password1 !== password2) {
    passwordCheckResult.errorMessages.push(
      messages.noPasswordMatch.defaultMessage,
    );
  }
  if (password1.length < passReq.min_length) {
    passwordCheckResult.errorMessages.push(
      `${messages.passwordMustContain.defaultMessage} ${passReq.min_length} ${
        messages.characters.defaultMessage
      }`,
    );
  }
  if (specialCharsNb < passReq.min_special_chars_count) {
    passwordCheckResult.errorMessages.push(
      `${messages.passwordMustContain.defaultMessage} ${passReq.min_special_chars_count} ${
        messages.specialCharacters.defaultMessage
      }`,
    );
  }
  if (numberOfDigits < passReq.min_digit_count) {
    passwordCheckResult.errorMessages.push(
      `${messages.passwordMustContain.defaultMessage} ${passReq.min_digit_count} ${
        messages.digits.defaultMessage
      }`,
    );
  }
  if (!upperAndLowerCases && passReq.different_letter_case_needed) {
    passwordCheckResult.errorMessages.push(
      messages.lowerAndUpperCase.defaultMessage,
    );
  }
  if (passwordCheckResult.errorMessages.length === 0) {
    passwordCheckResult.isCompliant = true;
  }
  return passwordCheckResult;
}
