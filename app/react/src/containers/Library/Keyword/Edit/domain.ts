import {
  KeywordResource,
  KeywordCreateRequest,
} from '../../../../models/keywordList/keywordList';
import { FieldArrayModel } from '../../../../utils/FormHelper';

export interface KeywordListFormData {
  name: string;
  list_type?: string;
  keywords: KeywordFieldModel[];
}

export type KeywordFormData = KeywordResource | KeywordCreateRequest;

export type KeywordFieldModel = FieldArrayModel<KeywordFormData>;

export const INITIAL_KEYWORD_LIST_FORM_DATA: KeywordListFormData = {
  name: '',
  list_type: 'UNION',
  keywords: [],
};
