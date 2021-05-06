import { AudienceSegmentsTable, SegmentsActionbar } from '../containers/Audience/Segments/List';
import { EditAudienceSegmentPage } from '../containers/Audience/Segments/Edit';
import { AudienceSegmentPage } from '../containers/Audience/Segments/Dashboard';
import AudienceFeedPage from '../containers/Audience/Segments/Edit/AudienceFeedForm/AudienceFeedPage';
import TimelinePage from '../containers/Audience/Timeline/TimelinePage';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';
import { AudienceBuilderPage } from '../containers/Audience/AudienceBuilder';
import HomePage from '../containers/Audience/Home/Dashboard/HomePage';
import AudienceFeedsActionBar from '../containers/Audience/Feeds/List/AudienceFeedsActionBar';
import { AudienceFeedsTable } from '../containers/Audience/Feeds/List';
import FeedsOverviewActionbar from '../containers/Audience/Feeds/Overview/FeedsOverviewActionbar';
import { AudienceFeedsOverview } from '../containers/Audience/Feeds/Overview';
import SegmentBuilderSelector from '../containers/Audience/SegmentBuilder/SegmentBuilderSelector';
import { SegmentBuilderPage } from '../containers/Audience/SegmentBuilder';

export const audienceDefinition: NavigatorDefinition = {
  audienceHome: {
    path: '/audience/home',
    layout: 'main',
    contentComponent: HomePage,
    requiredFeature: 'audience-dashboards',
    requireDatamart: true,
  },
  audienceSegmentList: {
    path: '/audience/segments',
    layout: 'main',
    contentComponent: AudienceSegmentsTable,
    actionBarComponent: SegmentsActionbar,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  audienceFeedList: {
    path: '/audience/feeds/list',
    layout: 'main',
    contentComponent: AudienceFeedsTable,
    actionBarComponent: AudienceFeedsActionBar,
    requiredFeature: 'audience-feeds',
    requireDatamart: true,
  },
  audienceFeedOverview: {
    path: '/audience/feeds',
    layout: 'main',
    contentComponent: AudienceFeedsOverview,
    actionBarComponent: FeedsOverviewActionbar,
    requiredFeature: 'audience-feeds',
    requireDatamart: true,
  },
  audienceSegmentCreation: {
    path: '/audience/segments/create',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  audienceSegmentEdit: {
    path: '/audience/segments/:segmentId/edit',
    layout: 'edit',
    editComponent: EditAudienceSegmentPage,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  audienceSegmentDashboard: {
    path: '/audience/segments/:segmentId',
    layout: 'main',
    contentComponent: AudienceSegmentPage,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  feedCreate: {
    path: '/audience/segments/:segmentId/feeds/create',
    layout: 'edit',
    editComponent: AudienceFeedPage,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  feedEdit: {
    path: '/audience/segments/:segmentId/feeds/:feedType/:feedId/edit',
    layout: 'edit',
    editComponent: AudienceFeedPage,
    requiredFeature: 'audience-segments',
    requireDatamart: true,
  },
  segmentBuilderSelector: {
    path: '/audience/segment-builder-selector',
    layout: 'main',
    contentComponent: SegmentBuilderSelector,
    requiredFeature: 'audience-segment_builder_v2',
    requireDatamart: true,
  },
  segmentBuilder: {
    path: '/audience/segment-builder',
    layout: 'main',
    contentComponent: SegmentBuilderPage,
    requiredFeature: 'audience-segment_builder',
    requireDatamart: true,
  },
  standardSegmentBuilder: {
    path: '/audience/segment-builder/standard',
    layout: 'main',
    contentComponent: AudienceBuilderPage,
    requiredFeature: 'audience-segment_builder_v2',
    requireDatamart: true,
  },
  advancedSegmentBuilder: {
    path: '/audience/segment-builder/advanced',
    layout: 'main',
    contentComponent: SegmentBuilderPage,
    requiredFeature: 'audience-segment_builder_v2',
    requireDatamart: true,
  },
  audienceTimeline: {
    path: '/audience/timeline/:identifierType/:identifierId',
    layout: 'main',
    contentComponent: TimelinePage,
    requiredFeature: 'audience-monitoring',
    requireDatamart: true,
  },
  audienceTimelineHome: {
    path: '/audience/timeline',
    layout: 'main',
    contentComponent: TimelinePage,
    requiredFeature: 'audience-monitoring',
    requireDatamart: true,
  },
};

export const audienceRoutes: NavigatorRoute[] = generateRoutesFromDefinition(audienceDefinition);
