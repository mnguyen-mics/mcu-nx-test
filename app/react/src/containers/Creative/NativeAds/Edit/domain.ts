import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { PluginVersionResource } from '../../../../models/Plugins';

export type NativeAdShape = DisplayAdResource | Partial<DisplayAdCreateRequest>;

export const DISPLAY_CREATIVE_FORM = 'displayCreativeForm';

export interface NativeCreativeFormData {
  creative: NativeAdShape;
  rendererPlugin: PluginVersionResource;
  properties: { [technicalName: string]: PropertyResourceShape };
}

export interface EditNativeCreativeRouteMatchParams {
  organisationId: string;
  nativeId?: string;
}

export function isNativeAdResource(
  creative: NativeAdShape,
): creative is DisplayAdResource {
  return (
    (creative as DisplayAdResource).id !== undefined &&
    creative.subtype === 'NATIVE'
  );
}

export type operationType = 'equals';

export interface CreativesInfosFieldModel {
  creativeProperty: keyof DisplayAdResource;
  action?: operationType;
  value?: string;
}

const operationMap = {
  equals: (targetValue: string, propertyValue?: string) => targetValue,
};

const operation = (
  chosenOperation: operationType,
  propertyValue: string,
  targetValue: string,
) => {
  return operationMap[chosenOperation](propertyValue, targetValue);
};

export default operation;
