export interface AutomationResource {
    id: string;
    name: string;
    datamart_id: string;
    organisation_id: string;
    status: 'ACTIVE' | 'PENDING' | 'NEW'
}

export interface AutomationCreateResource {
    name: string;
    datamart_id: string;
}