import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { PluginInterface } from '../../../../models/Plugins';

export type DisplayAdShape =
  | DisplayAdResource
  | Partial<DisplayAdCreateRequest>;

export const DISPLAY_CREATIVE_FORM = 'displayCreativeForm';

export interface DisplayCreativeFormData {
  creative: DisplayAdShape;
  rendererPlugin: PluginInterface;
  properties:  { [technicalName: string]: PropertyResourceShape }
}

export interface EditDisplayCreativeRouteMatchParams {
  organisationId: string;
  creativeId: string;
}

export function isDisplayAdResource(
  creative: DisplayAdShape,
): creative is DisplayAdResource {
  return (creative as DisplayAdResource).id !== undefined;
}
