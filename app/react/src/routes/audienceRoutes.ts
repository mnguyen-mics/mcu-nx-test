import {
  AudienceSegmentsTable,
  SegmentsActionbar,
} from '../containers/Audience/Segments/List';

import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';

import { EditAudienceSegmentPage } from '../containers/Audience/Segments/Edit';

import {
  AudienceSegment,
  AudienceSegmentActionbar,
} from '../containers/Audience/Segments/Dashboard';

import {
  AudiencePartitionsTable,
  PartitionsActionbar,
} from '../containers/Audience/Partitions/List';

import {
  TimelinePage,
} from '../containers/Audience/Timeline';
import { NavigatorRoute } from './routes';

import Partition from '../containers/Audience/Partitions/Dashboard/Partition';

const audienceRoutes: NavigatorRoute[] = [
  {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  {
    path: '/audience/segments/create/:type?',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  {
    path: '/audience/segments/:segmentId/edit',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  {
    path: '/audience/segments/:segmentId',
    layout: 'main',
    contentComponent: AudienceSegment,
    actionBarComponent: AudienceSegmentActionbar,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  {
    path: '/audience/partitions',
    layout: 'main',
    contentComponent: AudiencePartitionsTable,
    actionBarComponent: PartitionsActionbar,
    requiredFeature: 'audience.partitions',
    requireDatamart: true
  },
  {
    path: '/audience/partitions/:partitionId/edit',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
  },
  {
    path: '/audience/partitions/create',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
  },
  {
    path: '/audience/partitions/:partitionId',
    layout: 'main',
    contentComponent: Partition,
  },
  {
    path: '/audience/segment-builder',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'audience.segment_builder',
    requireDatamart: true
  },
  {
    path: '/audience/timeline/:identifierType?/:identifierId?',
    layout: 'main',
    contentComponent: TimelinePage,
    requiredFeature: 'audience.monitoring',
    requireDatamart: true
  },
];

export default audienceRoutes;
