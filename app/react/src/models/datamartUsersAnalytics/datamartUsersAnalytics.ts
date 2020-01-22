import { CounterProps } from "../../components/Counter/Counter";

type chartTypes = 'PIE' | 'AREA' | 'WORLDMAP' | 'STACKEDBAR' | 'COUNT' | 'TABS';

export type Dataset = { [key: string]: string | number | Date | undefined };

export interface Chart {
  type: chartTypes;
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
  fillOpacity: any;
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
