import { QueryLanguage } from './../datamart/DatamartResource';
import { SourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import {
  ChartApiOptions,
  ChartType,
} from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';

// TO DO: move into ADV library
export interface ChartSource {
  query_id: string;
  series_title?: string;
  type: QueryLanguage;
}

export interface SerieDataset {
  type: SourceType;
  sources: Array<ChartSource | SerieDataset>;
}

export interface DashboardChartContent {
  dataset: SerieDataset | ChartSource;
  options: ChartApiOptions;
  title: string;
  type: ChartType;
}
export interface ChartResource {
  archived: boolean;
  content: DashboardChartContent;
  created_by: string;
  created_ts: number;
  id: string;
  last_modified_ts?: number;
  last_modified_by?: string;
  organisation_id: string;
  title: string;
  type: ChartType;
}

export function isChartSource(dataset: SerieDataset | ChartSource): dataset is ChartSource {
  return !!(dataset as ChartSource).query_id;
}
