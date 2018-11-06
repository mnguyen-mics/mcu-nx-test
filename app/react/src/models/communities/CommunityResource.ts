export interface CommunityPasswordRequirement {
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