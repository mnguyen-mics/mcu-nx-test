import { KeywordListSelectionResource } from "../../../../models/keywordList/keywordList";

export interface KeywordListFormData {
    name?: string;
    list_type?: string;
    keywords?: KeywordListSelectionResource[] 
}