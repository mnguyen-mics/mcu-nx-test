import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { PluginVersionResource } from '../../../../models/Plugins';

export type DisplayAdShape =
  | DisplayAdResource
  | Partial<DisplayAdCreateRequest>;

export const DISPLAY_CREATIVE_FORM = 'displayCreativeForm';

export interface DisplayCreativeFormData {
  creative: DisplayAdShape;
  rendererPlugin: PluginVersionResource;
  properties: { [technicalName: string]: PropertyResourceShape };
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

export type operationType = 'equals';

export interface CreativesInfosFieldModel {
  creativeProperty: keyof DisplayAdResource;
  action?: operationType;
  value?: string;
}

const operationMap = {
  equals: (targetValue: string, propertyValue?: string) => targetValue
};

const operation = (
  chosenOperation: operationType,
  propertyValue: string,
  targetValue: string,
) => {
  return operationMap[chosenOperation](propertyValue, targetValue);
};

export default operation;
