export interface SearchFilter {
  keywords: string;
  currentPage: number;
  pageSize: number;
  datamartId?: string;
}

export interface SelectableItem {
  id: string;
}
