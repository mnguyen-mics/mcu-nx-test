export interface DealsListResource {
    id: string;
    name: string;
    organisation_id: string;
  }


  export interface DealsListSelectionCreateRequest {
    deal_list_id: string;
    ad_group_id?: string;
  }
  
  export interface DealsListSelectionResource extends DealsListSelectionCreateRequest {
    id: string;
    name: string;
    technical_name?: string;
  }

  export interface DealResource {
    id: string;
    value: string;
    organisation_id: string;
    ad_exchange_id: string;
    display_network_id: string;
    floor_price: string;
    currency: string;
    deal_list_id?: string;
  }