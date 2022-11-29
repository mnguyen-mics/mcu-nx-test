import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import {
  DisplayAdResource,
  CreativeResourceShape,
} from '../../../../models/creative/CreativeResource';
import { PluginVersionResource } from '../../../../models/Plugins';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { UploadFile } from 'antd/lib/upload/interface';

export type DisplayAdShape = DisplayAdResource | Partial<DisplayAdCreateRequest>;

export const DISPLAY_CREATIVE_FORM = 'displayCreativeForm';

export interface DisplayCreativeFormData {
  creative: DisplayAdShape;
  rendererPlugin: PluginVersionResource;
  properties: { [technicalName: string]: PropertyResourceShape };
  pluginLayout?: PluginLayout;
  repeatFields?: MultipleImageField[];
}

export interface MultipleImageField {
  file: UploadFile;
  name: string;
}

export interface EditDisplayCreativeRouteMatchParams {
  organisationId: string;
  creativeId: string;
}

export function isDisplayAdResource(creative: DisplayAdShape): creative is DisplayAdResource {
  return (creative as DisplayAdResource).id !== undefined;
}

export function creativeIsDisplayAdResource(
  creative: CreativeResourceShape,
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
  equals: (targetValue: string, propertyValue?: string) => targetValue,
};

const operation = (chosenOperation: operationType, propertyValue: string, targetValue: string) => {
  return operationMap[chosenOperation](propertyValue, targetValue);
};

export const IMAGE_AD_RENDERER = '1065';
export const HTML_AD_RENDRER = '1078';
export const EXTERNAL_AD_RENDERER = '1061';
export const IMAGE_SKINS_AD_RENDERER = '1057';
export const NATIVE_QUANTUM_AD_RENDERER = '1047';
export const NATIVE_IVIDENCE_AD_RENDERER = '1032';

export const isExistingCreative = (initialValues: Partial<DisplayCreativeFormData>) => {
  if (initialValues && initialValues.creative && isDisplayAdResource(initialValues.creative)) {
    return initialValues.creative;
  }
  return undefined;
};

export default operation;
