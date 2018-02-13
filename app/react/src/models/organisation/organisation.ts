
export interface Workspace {
    organisation_id: string;
    organisation_name: string;
}

export interface Cookie {
    mics_vid: string;
    mics_lts: string;
    mics_uaid: string;
}

export interface Datamart {
    id: string;
    name: string;
    organisation_id: string;
    token: string;
    creation_date: string;
    time_zone: string;
    type: 'DATAMART';
    datafarm: string;
    storage_model_version: string;
  }