import {
  DatamartUsersAnalyticsMetric,
  DatamartUsersAnalyticsDimension,
} from '../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../ReportRequestBody';
import { CounterProps } from '@mediarithmics-private/mcs-components-library/lib/components/counters/counter';

type ChartType =
  | 'PIE'
  | 'AREA'
  | 'WORLD_MAP'
  | 'STACKED_BAR'
  | 'COUNT'
  | 'TABS'
  | 'SINGLE_STAT'
  | 'COLUMN';

export type Dataset = { [key: string]: string | number | undefined };

export interface Chart {
  type: ChartType;
  enhancedManualReportView?: boolean;
  options: Highcharts.Options;
  dimensions?: DatamartUsersAnalyticsDimension[];
  metricNames: DatamartUsersAnalyticsMetric[];
  dimensionFilterClauses?: DimensionFilterClause;
  icons?: string[];
  counterFormatedProps?: CounterProps[];
  dataset?:
    | Highcharts.SeriesPieDataOptions[]
    | Highcharts.SeriesLineDataOptions[]
    | Highcharts.SeriesMapDataOptions[]
    | Highcharts.SeriesBarDataOptions[]
    | Highcharts.SeriesColumnDataOptions[];
  tabs?: TabItem[];
  unit?: 'time' | '%' | 'number' | '€';
  filterBy?: DatamartUsersAnalyticsDimension;
  sampling?: number;
}

export interface TabItem extends Chart {
  title: string;
}

export interface PieSeriesDataOption {
  name: string;
  y: number;
  color?: string;
}

export interface AreaSeriesDataOptions {
  name: string;
  fillColor: Highcharts.ColorString | Highcharts.GradientColorObject | Highcharts.PatternObject;
  fillOpacity: number;
  data: number[][];
  visible?: boolean;
  type: 'area';
  color?: string;
}

export interface BarSeriesDataOptions {
  data: number[];
  type: 'bar';
}

export interface MapSeriesDataOptions {
  code3: string;
  value: number;
}

export interface ColumnSeriesDataOptions {
  data: number[];
  type: 'column';
  showInLegend: false;
  name: string;
}

export type DimensionsWithLabel = { label: string; value: string };

export interface DimensionsList {
  dimensions: DimensionsWithLabel[];
}
