import { EmailHashResource } from './../timeline/timeline';

export interface UserConsentResource {
  $user_point_id?: string;
  $user_agent_id?: string;
  $compartment_id?: string;
  $user_account_id?: string;
  $email_hash?: EmailHashResource;
  $creation_ts: number;
  $channel_id?: string;
  $processing_id?: string;
  $consent_ts: number;
  $consent_value?: boolean;
  // Custom fields
  [key: string]: any;
}

export type LegalBasis =
  | 'CONSENT'
  | 'CONTRACTUAL_PERFORMANCE'
  | 'LEGAL_OBLIGATION'
  | 'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY'
  | 'LEGITIMATE_INTEREST';

export interface ProcessingResource {
  id: string;
  community_id: string;
  name: string;
  purpose: string;
  legal_basis: LegalBasis;
  technical_name: string;
  token: string;
  archived: boolean;
}

export interface UserChoices {
  userConsents: UserConsentResource[];
  processings: ProcessingResource[];
}

export interface ProcessingSelectionResource {
  id: string;
  processing_id: string;
  processing_name: string;
}