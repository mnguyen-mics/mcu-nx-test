import {
  CommunityPasswordRequirement,
  CommunityPasswordValidity,
} from '../../../models/communities';
import React from 'react';
import McsIcon from '../../../components/McsIcon';

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
    defaultMessage: 'Passwords cannot be too obvious',
  },
  lowerAndUpperCase: {
    id: 'check.passwords.lower.upper',
    defaultMessage: 'One lowercase and one uppercase character',
  },
});

function checkOrWarning(selector: boolean) {
  return selector ? (
    <McsIcon type="check" className="check-logo" />
  ) : (
    <McsIcon type="warning" className="warning-logo" />
  );
}

export function printPasswordRequirements(
  req: CommunityPasswordRequirement,
  val?: CommunityPasswordValidity,
) {
  return (
    <div>
      <p className="requirement-list">{messages.passwordMustContain.defaultMessage}</p>
      {req.min_length > 0 ? (
        <p className="requirement-list">
          {val ? checkOrWarning(val.is_long_enough) : <McsIcon type="info" className="icon" />}{' '}
          <span className="req-text">{req.min_length} {messages.characters.defaultMessage}</span>
        </p>
      ) : (
        ''
      )}
      {req.min_digit_count > 0 ? (
        <p className="requirement-list">
          {val ? checkOrWarning(val.has_enough_digits) : <McsIcon type="info" className="icon" />}{' '}
          <span className="req-text">{req.min_digit_count} {messages.digits.defaultMessage}</span>
        </p>
      ) : (
        ''
      )}
      {req.min_special_chars_count > 0 ? (
        <p className="requirement-list">
          {val ? checkOrWarning(val.has_enough_special_chars) : <McsIcon type="info" className="icon" />}{' '}
          <span className="req-text">{req.min_special_chars_count}{' '}{messages.specialCharacters.defaultMessage}</span>
        </p>
      ) : (
        ''
      )}
      {req.different_letter_case_needed ? (
        <p className="requirement-list">
          {val ? checkOrWarning(val.has_upper_and_lower_cases) : <McsIcon type="info" className="icon" />}{' '}
          <span className="req-text">{messages.lowerAndUpperCase.defaultMessage}</span>
        </p>
      ) : (
        ''
      )}
      {req.forbid_popular_passwords ? (
        <p className="requirement-list">
          {val ? checkOrWarning(val.is_not_popular) : <McsIcon type="info" className="icon" />}{' '}
          <span className="req-text">{messages.easyPasswords.defaultMessage}</span>
        </p>
      ) : (
        ''
      )}
    </div>
  );
}

export function printPasswordMatching(password1?: string, password2?: string) {
  return (
      <p className="requirement-list">
        {password2 === undefined
          ? <McsIcon type="info" className="icon" />
          : checkOrWarning(password1 === password2)}{' '}
        <span className="req-text">{messages.passwordMatch.defaultMessage}</span>
      </p>
  );
}

export function globalValidity(val?: CommunityPasswordValidity) {
  if (!val) {
    return false;
  } else {
    if (
      val.has_enough_digits === false ||
      val.has_enough_special_chars === false ||
      val.has_upper_and_lower_cases === false ||
      val.is_long_enough === false ||
      val.is_not_popular === false
    ) {
      return false;
    } else {
      return true;
    }
  }
}
