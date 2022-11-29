export interface ReportRequestBody {
  dimensions: Dimension[];
  dimension_filter_clauses?: DimensionFilterClause;
  metrics: Metric[];
  metric_filter_clauses?: MetricFilterClause;
  order_by?: OrderBy;
  first_result?: number;
  max_result?: number;
  date_ranges: DateRange[];
  sample_factor?: number;
}

export type DimensionFilterClause = FilterClause<DimensionFilter>;
export type MetricFilterClause = FilterClause<MetricFilter>;

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface Dimension {
  name: string;
}

export interface Filter {
  not?: boolean;
}

export interface FilterClause<F extends Filter> {
  operator: BooleanOperator;
  filters: F[];
}

export interface DimensionFilter extends Filter {
  id?: string;
  dimension_name: string;
  operator: DimensionFilterOperator;
  expressions: string[];
  case_sensitive?: boolean;
}
export interface MetricFilter extends Filter {
  metric_name: string;
  operator: MetricFilterOperator;
  comparison_value: string;
}

export interface Metric {
  expression: string;
  alias?: string;
  formatting_type?: FormattingType;
}

export interface OrderBy {
  field_name: string;
  sort_order?: SortBy;
}

export type SortBy = 'ASCENDING' | 'DESCENDING';

export type BooleanOperator = 'OR' | 'AND';

export type DimensionFilterOperator =
  | 'EXACT'
  | 'NUMERIC_EQUAL'
  | 'NUMERIC_GREATER_THAN'
  | 'NUMERIC_LESS_THAN'
  | 'IN_LIST';

export type MetricFilterOperator = 'EQUAL' | 'GREATER_THAN' | 'LESS_THAN';

export type FormattingType = 'INTEGER' | 'FLOAT' | 'TIME' | 'PERCENT';
