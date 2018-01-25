export type ConsentPurpose = 'EMAIL_OPTIN';

export interface ConsentResource {
  id: string;
  organisation_id: string;
  name: string;
  technical_name: string;
  purpose: ConsentPurpose;
}

export interface ConsentSelectionCreateRequest {
  consent_id: string;
}

export interface ConsentSelectionResource extends ConsentSelectionCreateRequest {
  id: string;
  name: string;
  technical_name: string;
}
