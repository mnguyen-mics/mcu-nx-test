export interface SearchFilter {
  keywords: string;
  currentPage: number;
  pageSize: number;
  datamart_id?: string;
}

export interface SelectableItem {
  id: string;
}
