import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';
import HomePage from '../containers/Home/Dashboard/HomePage';

export const homeDefinition: NavigatorDefinition = {
  mainHome: {
    path: '/home',
    layout: 'main',
    contentComponent: HomePage,
    requireDatamart: true,
  },
};

export const homeRoutes: NavigatorRoute[] = generateRoutesFromDefinition(homeDefinition);
