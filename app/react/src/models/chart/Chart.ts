import { ChartType } from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';

export interface ChartResource {
  id: string;
  title: string;
  type: ChartType;
  content: string;
  organisation_id: string;
  archived: boolean;
  last_modified_ts?: number;
  last_modified_by?: string;
}
