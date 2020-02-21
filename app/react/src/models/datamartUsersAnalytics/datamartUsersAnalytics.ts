import { CounterProps } from "../../components/Counter/Counter";
import { DatamartUsersAnalyticsMetric, DatamartUsersAnalyticsDimension } from "../../utils/DatamartUsersAnalyticsReportHelper";
import { DimensionFilterClause } from "../ReportRequestBody";

type ChartType = 'PIE' | 'AREA' | 'WORLD_MAP' | 'STACKED_BAR' | 'COUNT' | 'TABS' | 'SINGLE_STAT';

export type Dataset = { [key: string]: string | number | Date | undefined };

export interface Chart {
  type: ChartType;
  options: Highcharts.Options;
  dimensions: DatamartUsersAnalyticsDimension[];
  yKey: string | number;
  metricName: DatamartUsersAnalyticsMetric;
  dimensionFilterClauses?: DimensionFilterClause;
  icons?: string[];
  counterFormatedProps?: CounterProps[];
  dataset?: 
  Highcharts.SeriesPieDataOptions[] | 
  Highcharts.SeriesLineDataOptions[] | 
  Highcharts.SeriesMapDataOptions[] | 
  Highcharts.SeriesBarDataOptions[];
  tabs: TabItem[]
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
