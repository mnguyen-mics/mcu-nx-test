import {
  CollectionVolumesDimension,
  CollectionVolumesMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/CollectionVolumesReportHelper';

const collectionVolumesMetricArray: CollectionVolumesMetric[] = ['count'];

const collectionVolumesDimensionArray: CollectionVolumesDimension[] = [
  'organisation_id',
  'community_id',
  'collection',
  'date_time',
];

export { collectionVolumesMetricArray, collectionVolumesDimensionArray };
