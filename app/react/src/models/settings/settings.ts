export interface PropertyResource {
    creation_ts: number;
    datamart_id: string
    id: string;
    name: string;
    organisation_id: string;
    token: string;
    visit_analyzer_model_id: string;
}

export interface MobileApplicationResource extends PropertyResource {
    type: 'MOBILE_APPLICATION';
}

export interface SiteResource extends PropertyResource {
    type: 'SITE';
}