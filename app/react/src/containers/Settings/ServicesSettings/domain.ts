import { AutomaticRecordType } from "../../../models/billingAccounts/BillingAccountResource";

export interface OfferFormData {
    name: string;
    custom: boolean;
    credited_account_id: string;
    automatic_on?: AutomaticRecordType;
}

export type offerType = "my_offer" | "subscribed_offer";