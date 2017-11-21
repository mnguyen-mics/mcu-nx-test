export interface ReportView {
  report_view: {
    items_per_page: number;
    total_items: number;
    columns_headers: string[];
    rows: any[][];
  };
}
