import { CreateCreativeResource } from './domain';
import { PropertyResourceShape } from './../../../../../../../models/Plugins';
import { DisplayAdResource } from './../../../../../../../models/creative/CreativeResource';
import { AdResource, AdCreateRequest, RendererDataProps } from '../../../../../../../models/campaign/display/AdResource';

export interface CreateCreativeResource {
  creative: DisplayAdResource;
  properties: PropertyResourceShape[];
  rendererData: RendererDataProps;
}
export type AdFieldModelResourceShape = AdResource | AdCreateRequest | CreateCreativeResource;
export interface AdFieldModel {
  id: string;
  resource: AdFieldModelResourceShape;
}

export function isCreateCreativeResource(
  resource: AdFieldModelResourceShape,
): resource is CreateCreativeResource {
  return (resource as CreateCreativeResource).creative !== undefined &&
    (resource as CreateCreativeResource).rendererData !== undefined;
}

export function isAdResource(
  resource: AdFieldModelResourceShape,
): resource is AdResource {
  return (resource as AdResource).id !== undefined &&
  (resource as AdResource).creative_id !== undefined;
}
