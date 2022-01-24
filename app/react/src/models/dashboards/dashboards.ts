import { ChartConfig } from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';
import { Layout } from 'react-grid-layout';
import { OTQLResult, QueryPrecisionMode } from '../datamart/graphdb/OTQLResult';

export type DashoboardScope = 'home' | 'segments' | 'builders';
export type DashboardType = 'HOME' | 'SEGMENT' | 'AUDIENCE_BUILDER';
export type ChartDatasetType = 'otql';
export type DashboardContentChartType = 'PIE' | 'BARS' | 'RADAR' | 'METRIC';
export type ComponentType =
  | 'MAP_BAR_CHART'
  | 'MAP_PIE_CHART'
  | 'DATE_AGGREGATION_CHART'
  | 'COUNT'
  | 'PERCENTAGE'
  | 'GAUGE_PIE_CHART'
  | 'MAP_STACKED_BAR_CHART'
  | 'WORLD_MAP_CHART'
  | 'COUNT_BAR_CHART'
  | 'COUNT_PIE_CHART'
  | 'TOP_INFO_COMPONENT'
  | 'MAP_RADAR_CHART'
  | 'MAP_INDEX_CHART';

export interface DashboardResource {
  id: string;
  title: string;
  scopes: DashoboardScope[];
  segment_ids: string[];
  builder_ids: string[];
  archived: boolean;
}

export interface DashboardContentCard {
  x: number;
  y: number;
  w: number;
  h: number;
  layout?: string;
  charts: ChartConfig[];
}

export interface DashboardContentSectionsContent {
  title: string;
  cards: DashboardContentCard[];
}

export interface DashboardContent {
  content: string;
}

export interface DashboardContentResource {
  data: DashboardContent;
}

export interface DashboardContentSections {
  sections: DashboardContentSectionsContent[];
}

export interface DashboardPageContent {
  title: string;
  dashboardContent?: DashboardContentSections;
}

export interface DashboardContentDataset {
  type: ChartDatasetType;
  query_id: string;
}

export interface DashboardsOptions {
  archived?: boolean;
  isCommunity?: boolean;
}

export interface BaseComponent {
  id: number;
  component_type: ComponentType;
  title: string;
  description?: string;
  precision?: QueryPrecisionMode;
}

export interface ComponentChart extends BaseComponent {
  component_type: 'MAP_PIE_CHART' | 'TOP_INFO_COMPONENT';
  show_legend: boolean;
  query_id: string;
  data?: OTQLResult;
  labels_enabled?: boolean;
}

export interface DataLabel {
  format: string;
  enable: boolean;
  filterValue: number;
}

export interface TooltipChart {
  formatter: string;
}

export interface MapBarComponent extends BaseComponent {
  component_type: 'MAP_BAR_CHART';
  show_legend: boolean;
  query_id: string;
  shouldCompare?: boolean;
  data?: OTQLResult;
  percentage?: boolean;
  labels_enabled?: boolean;
  vertical?: boolean;
  sortKey?: 'A-Z' | 'Z-A';
  labels?: DataLabel;
  tooltip?: TooltipChart;
  drilldown?: boolean;
  stacking?: boolean;
  reducePadding?: boolean;
}

export interface MapRadarChart extends BaseComponent {
  component_type: 'MAP_RADAR_CHART';
  show_legend: boolean;
  query_id: string;
  shouldCompare?: boolean;
  data?: OTQLResult;
  percentage?: boolean;
  labels_enabled?: boolean;
  vertical?: boolean;
  labels?: DataLabel;
  sortKey?: 'A-Z' | 'Z-A';
  tooltip?: TooltipChart;
}

export interface DateAggregationComponent extends BaseComponent {
  component_type: 'DATE_AGGREGATION_CHART';
  query_ids: string[];
  plot_labels: string[];
  labels_enabled?: boolean;
  format?: string;
}

export interface CountPieComponent extends BaseComponent {
  component_type: 'COUNT_PIE_CHART';
  show_legend: boolean;
  query_ids: string[];
  labels_enabled?: boolean;
  plot_labels: string[];
}

export interface ComponentCountBar extends BaseComponent {
  component_type: 'COUNT_BAR_CHART';
  show_legend: boolean;
  query_ids: string[];
  labels_enabled?: boolean;
  plot_labels: string[];
}

export interface ComponentCount extends BaseComponent {
  component_type: 'COUNT';
  query_id: string;
  prefix?: string;
  suffix?: string;
}

export interface ComponentPercentage extends BaseComponent {
  component_type: 'PERCENTAGE';
  query_id: string;
  total_query_id: string;
}

export interface GaugeComponent extends BaseComponent {
  component_type: 'GAUGE_PIE_CHART';
  query_ids: string[];
  show_percentage: boolean;
}

export interface MapStackedBarChart extends BaseComponent {
  component_type: 'MAP_STACKED_BAR_CHART';
  query_ids: string[];
  keys: string[];
  show_legend: boolean;
  labels_enabled?: boolean;
}

export interface MapIndexChart extends BaseComponent {
  component_type: 'MAP_INDEX_CHART';
  show_legend: boolean;
  query_id: string;
  shouldCompare?: boolean;
  data?: OTQLResult;
  percentage?: boolean;
  labels_enabled?: boolean;
  vertical?: boolean;
  sortKey?: 'A-Z' | 'Z-A';
  labels?: DataLabel;
  tooltip?: TooltipChart;
  showTop?: number;
  minimumPercentage?: number;
}

export interface WorldMapChart extends BaseComponent {
  component_type: 'WORLD_MAP_CHART';
  query_id: string;
}

export type Component =
  | ComponentChart
  | ComponentCount
  | GaugeComponent
  | MapStackedBarChart
  | WorldMapChart
  | ComponentCountBar
  | ComponentPercentage
  | DateAggregationComponent
  | CountPieComponent
  | MapBarComponent
  | MapRadarChart
  | MapIndexChart;

export interface ComponentLayout {
  layout: Layout;
  component: Component;
}
