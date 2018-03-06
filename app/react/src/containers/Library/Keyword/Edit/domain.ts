import { KeywordListSelectionResource } from '../../../../models/keywordList/keywordList';
import { FieldArrayModel } from '../../../../utils/FormHelper';

export interface KeywordListFormData {
  name?: string;
  list_type?: string;
  keywords?: KeywordFieldModel[];
}

export type KeywordFieldModel = FieldArrayModel<KeywordListSelectionResource>;
