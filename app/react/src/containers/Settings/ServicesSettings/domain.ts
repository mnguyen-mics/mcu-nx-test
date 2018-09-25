export interface OfferFormData {
    name: string;
    custom: boolean;
    credited_account_id: string;
    automatic_on?: "AUDIENCE_SEGMENT" | "DEAL_LIST" | "PLACEMENT_LIST" | "KEYWORDS_LIST";
}