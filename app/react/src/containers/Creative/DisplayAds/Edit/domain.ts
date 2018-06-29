import { PropertyResourceShape } from './../../../../models/plugin/index';
import { DisplayAdCreateRequest } from './../../../../models/creative/CreativeResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { PluginVersionResource } from '../../../../models/Plugins';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { UploadFile } from 'antd/lib/upload/interface';

export type DisplayAdShape =
  | DisplayAdResource
  | Partial<DisplayAdCreateRequest>;

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

export type CustomUploadType = 'image' | 'data_file';

interface PluginDefinitionBaseItem {
  id: string;
  allowMultipleUpload: boolean;
}

export interface PluginDefinitionComplexItem extends PluginDefinitionBaseItem {
  customUploadType: CustomUploadType,
  propertiesFormatter: (properties:  { [technicalName: string]: PropertyResourceShape }) => { [technicalName: string]: PropertyResourceShape }
}

interface PluginDefinitionImageItem extends PluginDefinitionComplexItem {
  customUploadType: 'image',
}

interface PluginDefinitionDataFileItem extends PluginDefinitionComplexItem {
  customUploadType: 'data_file';
}

type PluginDefinitionItem = PluginDefinitionBaseItem |  PluginDefinitionImageItem |  PluginDefinitionDataFileItem;

export const MicsPLuginDefinition: { [key: string]: PluginDefinitionItem } = {
  imageAdRendererId: {
    id: '1065',
    allowMultipleUpload: true,
    customUploadType: 'image',
    propertiesFormatter: (properties?: { [technicalName: string]: PropertyResourceShape }) => {
      if (properties) {
        const { image, ...formattedProperties } = properties;
        return formattedProperties;
      }
      return {}
    }
  },
  htmlAdRendererId: { 
    id: '1078',
    allowMultipleUpload: false,
  },
  externalAdRendererId: {
    id: '1061',
    allowMultipleUpload: false
  },
  nativeIvidenceAdRendererId: {
    id: '1032',
    allowMultipleUpload: false
  },
  nativeQuantumAdRendererId: {
    id: '1047',
    allowMultipleUpload: false
  },
  imageSkinsAdRendererId: {
    id: '1057',
    allowMultipleUpload: false
  },
}

export default operation;
