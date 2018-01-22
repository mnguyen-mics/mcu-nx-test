import {
  AudienceSegmentsTable,
  SegmentsActionbar,
} from '../containers/Audience/Segments/List';

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

import {
  QueryToolPage,
} from '../containers/Audience/Query/index.ts';

const audienceRoutes = [
  {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar,
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
    path: '/audience/timeline/:identifierType?/:identifierId?',
    layout: 'main',
    contentComponent: TimelinePage,
  },
  {
    path: '/audience/query',
    layout: 'main',
    contentComponent: QueryToolPage,
  },
];

export default audienceRoutes;
