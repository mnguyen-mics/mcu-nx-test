import {
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
} from './../../utils/LocationSearchHelper';
export interface SearchFilter
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {}

export interface SelectableItem {
  id: string;
}
