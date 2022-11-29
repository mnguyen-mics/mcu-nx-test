export interface Cookie {
  mics_vid: string;
  mics_lts: string;
  mics_uaid: string;
}

export interface OrganisationResource {
  id: string;
  name: string;
  market_id: string;
  community_id: string;
  technical_name?: string;
  administrator_id?: string;
  archived: boolean;
}
