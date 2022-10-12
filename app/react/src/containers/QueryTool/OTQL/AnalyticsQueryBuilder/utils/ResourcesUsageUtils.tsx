import {
  ResourcesUsageDimension,
  ResourcesUsageMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/ResourcesUsageReportHelper';

const resourcesUsageMetricArray: ResourcesUsageMetric[] = ['scan_cost', 'read_cost', 'write_cost'];

const resourcesUsageDimensionArray: ResourcesUsageDimension[] = [
  'community_id',
  'organisation_id',
  'datamart_id',
  'date_time',
  'execution_id',
  'resource_id',
  'source',
  'sub_source',
];

export { resourcesUsageMetricArray, resourcesUsageDimensionArray };
