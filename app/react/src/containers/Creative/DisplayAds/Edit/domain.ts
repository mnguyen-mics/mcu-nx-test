import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import { DisplayAdResource } from "../../../../models/creative/CreativeResource";

type DisplayAdShape = DisplayAdResource | Partial<DisplayAdCreateRequest>;

export interface DisplayCreativeFormData {
  creative: DisplayAdShape;
  rendererProperties: PropertyResourceShape[];
}

export const INITIAL_DISPLAY_CREATIVE_FORM_DATA: DisplayCreativeFormData = {
  creative: {},
  rendererProperties: []
};

export interface EditDisplayCreativeRouteMatchParams {
  organisationId: string;
  creativeId: string;
}

export function isDisplayAdResource(
  creative: DisplayAdShape,
): creative is DisplayAdResource {
  return (creative as DisplayAdResource).id !== undefined;
}
