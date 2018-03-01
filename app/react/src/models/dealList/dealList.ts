export interface DealsListResource {
    id: string;
    name: string;
    organisation_id: string;
  }


  export interface DealsListSelectionCreateRequest {
    deal_list_id: string;
    ad_group_id: string;
  }
  
  export interface DealsListSelectionResource extends DealsListSelectionCreateRequest {
    id: string;
    name: string;
    technical_name?: string;
  }
