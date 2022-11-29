export interface ReportViewResource {
  report_view: ReportView;
}
export interface ReportView {
  items_per_page: number;
  total_items: number;
  columns_headers: string[];
  rows: any[][];
}
