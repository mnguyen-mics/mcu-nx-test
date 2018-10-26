import {
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
  TypeSearchSettings,
} from './../../utils/LocationSearchHelper';
export interface SearchFilter
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    TypeSearchSettings,
    DatamartSearchSettings {}

export interface SelectableItem {
  id: string;
}
