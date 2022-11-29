// ATYPER CAR FAUX

export interface AdExchangeResource {
  id: string;
  list_type: string;
  name: string;
  organisation_id: string;
}

export interface AdExchangeSelectionCreateRequest {
  ad_exchange_id: string;
  exclude: boolean;
}

export interface AdExchangeSelectionResource extends AdExchangeSelectionCreateRequest {
  id: string;
  name: string;
  technical_name?: string;
}
