import {
  AudienceSegmentsTable,
  SegmentsActionbar,
} from '../containers/Audience/Segments/List';

import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';

import { EditAudienceSegmentPage } from '../containers/Audience/Segments/Edit';

import {
  AudienceSegmentPage,
} from '../containers/Audience/Segments/Dashboard';

import {
  AudiencePartitionsTable,
  PartitionsActionbar,
} from '../containers/Audience/Partitions/List';

import {
  TimelinePage,
} from '../containers/Audience/Timeline';

import Partition from '../containers/Audience/Partitions/Dashboard/Partition';
import AudiencePartitionPage from '../containers/Audience/Partitions/Edit/AudiencePartitionPage';

import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';


export const audienceDefinition: NavigatorDefinition = {
  audienceSegmentList: {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  audienceSegmentCreation: {
    path: '/audience/segments/create/:type?',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  audienceSegmentEdit: {
    path: '/audience/segments/:segmentId/edit',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  audienceSegmentDashboard: {
    path: '/audience/segments/:segmentId',
    layout: 'main',
    contentComponent: AudienceSegmentPage,
    requiredFeature: 'audience.segments',
    requireDatamart: true
  },
  audiencePartitionsList: {
    path: '/audience/partitions',
    layout: 'main',
    contentComponent: AudiencePartitionsTable,
    actionBarComponent: PartitionsActionbar,
    requiredFeature: 'audience.partitions',
    requireDatamart: true
  },
  audiencePartitionsEdit: {
    path: '/audience/partitions/:partitionId/edit',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
    requiredFeature: 'audience.partitions',
    requireDatamart: true
  },
  audiencePartitionsCreate: {
    path: '/audience/partitions/create',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
    requiredFeature: 'audience.partitions',
    requireDatamart: true
  },
  audiencePartitionsDashboard: {
    path: '/audience/partitions/:partitionId',
    layout: 'main',
    contentComponent: Partition,
    requiredFeature: 'audience.partitions',
    requireDatamart: true
  },
  audienceSegmentBuilder: {
    path: '/audience/segment-builder',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'audience.segment_builder',
    requireDatamart: true
  },
  audienceTimeline: {
    path: '/audience/timeline/:identifierType?/:identifierId?',
    layout: 'main',
    contentComponent: TimelinePage,
    requiredFeature: 'audience.monitoring',
    requireDatamart: true
  },
}

export const audienceRoutes: NavigatorRoute[] = generateRoutesFromDefinition(audienceDefinition);
