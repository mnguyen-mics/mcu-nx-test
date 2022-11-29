import {
  DataIngestionDimension,
  DataIngestionMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/DataIngestionReportHelper';

const dataIngestionMetricArray: DataIngestionMetric[] = ['event_count', 'error_count'];

const dataIngestionDimensionArray: DataIngestionDimension[] = [
  'community_id',
  'organisation_id',
  'datamart_id',
  'date_time',
  'date_yyyy_mm_dd',
  'date_yyyy_mm_dd_hh',
  'date_yyyy_mm_dd_hh_mm',
  'event_ts',
  'event_name',
  'channel_id',
  'pipeline_step',
  'error_type',
];

export { dataIngestionMetricArray, dataIngestionDimensionArray };
