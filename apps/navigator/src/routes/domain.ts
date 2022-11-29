import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { Mention } from '@mediarithmics-private/mcs-components-library/lib/components/mention-tag/MentionTag';
import { MessageDescriptor } from 'react-intl';
import { Omit } from '../utils/Types';

export type LayoutTypes = 'main' | 'edit' | 'settings';

export interface DataLayerDefinition {
  [key: string]: any;
}
export interface RouteDef {
  path: string;
  layout: LayoutTypes;
  requiredFeature?: string | string[];
  requireDatamart?: boolean;
  legacyPath?: boolean;
  datalayer?: DataLayerDefinition;
}

export interface RouteEdit extends RouteDef {
  layout: 'edit';
  editComponent: React.ComponentType;
}

export interface RouteStandard extends RouteDef {
  layout: 'main';
  contentComponent: React.ComponentType;
  actionBarComponent?: React.ComponentType;
}

export interface RouteSettings extends RouteDef {
  layout: 'settings';
  contentComponent: React.ComponentType;
}

export type NavigatorRoute = RouteEdit | RouteStandard | RouteSettings;

export interface NavigatorDefinition {
  [key: string]: NavigatorRoute;
}

type MenuType = 'simple' | 'multi';

interface NavigatorBaseMenuDefinition {
  iconType: McsIconType;
  type: MenuType;
  translation: MessageDescriptor;
  mention?: Mention;
}

interface NavigatorSingleLevelMenuDefinition
  extends NavigatorBaseMenuDefinition,
    Omit<RouteDef, 'layout'> {
  type: 'simple';
}

export interface NavigatorSubMenuDefinition extends Omit<RouteDef, 'layout'> {
  translation: MessageDescriptor;
  iconType?: McsIconType;
  mention?: Mention;
  communityOnly?: boolean;
}

export interface NavigatorMultipleLevelMenuDefinition extends NavigatorBaseMenuDefinition {
  type: 'multi';
  subMenuItems: NavigatorSubMenuDefinition[];
}

export type NavigatorMenuDefinition =
  | NavigatorSingleLevelMenuDefinition
  | NavigatorMultipleLevelMenuDefinition;

export function generateRoutesFromDefinition(definition: NavigatorDefinition): NavigatorRoute[] {
  return Object.keys(definition).map(key => definition[key]);
}

export function generateMissingdefinitionItemFromRoute(
  route: NavigatorRoute,
): Omit<RouteDef, 'layout'> {
  return {
    path: route.path,
    requiredFeature: route.requiredFeature,
    requireDatamart: route.requireDatamart,
  };
}
