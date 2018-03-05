import {
  AudienceSegmentsTable,
  SegmentsActionbar,
} from '../containers/Audience/Segments/List';

import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage.tsx';

import { EditAudienceSegmentPage } from '../containers/Audience/Segments/Edit/index.ts';

import {
  AudienceSegment,
  AudienceSegmentActionbar,
} from '../containers/Audience/Segments/Dashboard';

import {
  AudiencePartitionsTable,
  PartitionsActionbar,
} from '../containers/Audience/Partitions/List';

import { TimelinePage } from '../containers/Audience/Timeline';

import AudiencePartitionPage from '../containers/Audience/Partitions/Edit/AudiencePartitionPage.tsx';

import Partition from '../containers/Audience/Partitions/Dashboard/Partition.tsx';
import PartitionActionBar from '../containers/Audience/Partitions/Dashboard/PartitionActionBar.tsx';

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
    path: '/audience/partition/:partitionId/edit',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
  },
  {
    path: '/audience/partition/new',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
  },
  {
    path: '/audience/partition/:partitionId/dashboard',
    layout: 'main',
    contentComponent: Partition,
    actionBarComponent: PartitionActionBar,
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
