export type ConsentPurpose = 'EMAIL_OPTIN';

export interface ConsentResource {
  id: string;
  organisation_id: string;
  name: string;
  technical_name: string;
  purpose: ConsentPurpose;
}

export interface ConsentSelectionResource {
  id: string;
  name: string;
  technical_name: string;
  consent_id: string;
}
