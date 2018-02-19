export interface PropertyResource {
    creation_ts: number;
    datamart_id: string
    id: string;
    name: string;
    organisation_id: string;
    token: string;
    visit_analyzer_model_id: string | null;
}


export interface MobileApplicationResource extends PropertyResource {
    type: 'MOBILE_APPLICATION';
}

export interface MobileApplicationCreationResource extends Partial<PropertyResource> {
    type: 'MOBILE_APPLICATION';
}

export interface SiteResource extends PropertyResource {
    type: 'SITE';
}