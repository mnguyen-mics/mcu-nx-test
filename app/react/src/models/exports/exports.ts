export interface Export {
    datamart_id: string;
    id: string;
    name: string;
    organisation_id: string;
    output_format: string;
    query_id: string;
    type: string;
}


export interface ExportCreateResource {
    name: string;
    output_format: 'CSV';
    query_id: string;
    type: 'QUERY';
}