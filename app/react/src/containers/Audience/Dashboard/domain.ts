export type LayoutShape = Rows[]

export interface Rows {
  columns: Column[]
}

export interface Column {
  span: number;
  query_id: string;
  datamart_id: string;
  component_type: ComponentType;
  title: string;
}

type ComponentType = 'MAP_BAR_CHART' | 'MAP_PIE_CHART' | 'DATE_AGGREGATION_CHART' | 'COUNT'