import FunnelDemoPage from '../containers/Audience/FunnelDemo/FunnelDemoPage';
import {
  NavigatorRoute,
  NavigatorDefinition,
  generateRoutesFromDefinition,
} from './domain';


export const funnelDefinition: NavigatorDefinition = {
  audienceHome: {
    path: "/audience/funnel",
    layout: "main",
    contentComponent: FunnelDemoPage,
    requiredFeature: 'funnel-analytics',
    requireDatamart: true,
  }
};

export const funnelRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  funnelDefinition,
);
