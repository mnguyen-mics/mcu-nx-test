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

import { TimelinePage } from '../containers/Audience/Timeline';

import AudiencePartitionPage from '../containers/Audience/Partitions/Edit/AudiencePartitionPage';

import Partition from '../containers/Audience/Partitions/Dashboard/Partition';

const audienceRoutes = [
  {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar,
  },
  {
    path: '/audience/segments/create/:type?',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
  },
  {
    path: '/audience/segments/:segmentId/edit',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
  },
  {
    path: '/audience/segments/:segmentId',
    layout: 'main',
    contentComponent: AudienceSegment,
    actionBarComponent: AudienceSegmentActionbar,
  },
  {
    path: '/audience/partitions',
    layout: 'main',
    contentComponent: AudiencePartitionsTable,
    actionBarComponent: PartitionsActionbar,
  },
  {
    path: '/audience/partitions',
    layout: 'main',
    contentComponent: AudiencePartitionsTable,
    actionBarComponent: PartitionsActionbar,
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
    path: '/audience/partitions/:partitionId/dashboard',
    layout: 'main',
    contentComponent: Partition,
  },
  {
    path: '/audience/segment-builder',
    layout: 'main',
    contentComponent: QueryToolPage,
  },
  {
    path: '/audience/timeline/:identifierType?/:identifierId?',
    layout: 'main',
    contentComponent: TimelinePage,
  },
];

export default audienceRoutes;
