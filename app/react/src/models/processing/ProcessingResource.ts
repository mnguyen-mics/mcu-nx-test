export type LegalBasis =
  | 'CONSENT'
  | 'CONTRACTUAL_PERFORMANCE'
  | 'LEGAL_OBLIGATION'
  | 'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY'
  | 'LEGITIMATE_INTEREST';

export default interface ProcessingResource {
  id: string;
  community_id: string;
  name: string;
  purpose: string;
  legal_basis: LegalBasis;
  technical_name: string;
  token: string;
  archived: boolean;
}
