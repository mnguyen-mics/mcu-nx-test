export interface PasswordRequirementResource {
  type: 'PASSWORD_REQUIREMENTS';
  id: string;
  version?: string;
  community_id: number;
  archived: boolean;
  deleted: boolean;
  min_digit_count: number;
  min_special_chars_count: number;
  different_letter_case_needed: boolean;
  min_length: number;
  forbid_popular_passwords: boolean;
}

export interface PasswordValidityResource {
  is_long_enough: boolean;
  has_enough_digits: boolean;
  has_enough_special_chars: boolean;
  has_upper_and_lower_cases: boolean;
  is_not_popular: boolean;
}
