import {
  OverviewContent,
  OverviewActionBar,
} from '../containers/Analytics/Overview';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const analyticsDefinition: NavigatorDefinition = {
  analyticsOverview: {
    path: '/analytics/overview',
    layout: 'main',
    contentComponent: OverviewContent,
    actionBarComponent: OverviewActionBar,
    requiredFeature: 'analytics.overview',
    requireDatamart: true
  },
}

export const analyticsRoutes: NavigatorRoute[] = generateRoutesFromDefinition(analyticsDefinition)
