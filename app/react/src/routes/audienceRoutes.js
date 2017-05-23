import {
  AudienceSegmentsTable,
  SegmentsActionbar
} from '../containers/Audience/Segments/List';

import {
  AudiencePartitionsTable,
  PartitionsActionbar
} from '../containers/Audience/Partitions/List';

const audienceRoutes = [
  {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar
  },
  {
    path: '/audience/partitions',
    layout: 'main',
    contentComponent: AudiencePartitionsTable,
    actionBarComponent: PartitionsActionbar
  }
];

export default audienceRoutes;
