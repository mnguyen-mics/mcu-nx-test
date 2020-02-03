import { CounterProps } from "../../components/Counter/Counter";

type ChartType = 'PIE' | 'AREA' | 'WORLDMAP' | 'STACKEDBAR' | 'COUNT' | 'TABS';

export type Dataset = { [key: string]: string | number | Date | undefined };

export interface Chart {
  type: ChartType;
  options: Highcharts.Options;
  xKey: string;
  yKey: string | number;
  metricName: string;
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
  fillColor: any;
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
