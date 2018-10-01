export interface BillingAccountResource {
    id: string;
    organisation_id: string;
    technical_name?: string;
    currency: string;
    automatic_on: AutomaticRecordType;
}

export type AutomaticRecordType = "AUDIENCE_SEGMENT" | "DEAL_LIST" | "PLACEMENT_LIST" | "KEYWORDS_LIST";