import { Layout } from "react-grid-layout";

export interface DashboardResource {
  id: string,
  type: DashboardType;
  datamart_id: string;
  name: string;
  components: ComponentLayout[]
}

export type DashboardType = "HOME" | "SEGMENT"

export interface ComponentLayout {
  layout: Layout;
  component: Component;
}

export interface BaseComponent {
  id: number;
  component_type: ComponentType;
  title: string;
  description?: string;
}

export interface ComponentChart extends BaseComponent {
  component_type: 'MAP_BAR_CHART' | 'MAP_PIE_CHART' | 'DATE_AGGREGATION_CHART';
  show_legend: boolean;
  query_id: string;
  labels_enabled?: boolean;
}

export interface ComponentCountBar extends BaseComponent {
  component_type: 'COUNT_BAR_CHART';
  show_legend: boolean;
  query_ids: string[];
  labels_enabled?: boolean;
  type: 'age_det' | 'reader_status' | 'age_prob';
}

export interface ComponentCount extends BaseComponent {
  component_type: 'COUNT';
  query_id: string;
  prefix?: string;
  suffix?: string;
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
  | ComponentCountBar;

export type ComponentType =
  | 'MAP_BAR_CHART'
  | 'MAP_PIE_CHART'
  | 'DATE_AGGREGATION_CHART'
  | 'COUNT'
  | 'GAUGE_PIE_CHART'
  | 'MAP_STACKED_BAR_CHART'
  | 'WORLD_MAP_CHART'
  | 'COUNT_BAR_CHART';