
import { AdResource, AdCreateRequest } from '../../../../../../../models/campaign/display/AdResource';
import { DisplayCreativeFormData } from '../../../../../../Creative/DisplayAds/Edit/domain';


export type AdFieldModelResourceShape = AdResource | AdCreateRequest | DisplayCreativeFormData;
export interface AdFieldModel {
  id: string;
  resource: AdFieldModelResourceShape;
}

export function isDisplayCreativeFormData(
  resource: AdFieldModelResourceShape,
): resource is DisplayCreativeFormData {
  return (resource as DisplayCreativeFormData).creative !== undefined &&
    (resource as DisplayCreativeFormData).rendererProperties !== undefined;
}

export function isAdResource(
  resource: AdFieldModelResourceShape,
): resource is AdResource {
  return (resource as AdResource).id !== undefined &&
  (resource as AdResource).creative_id !== undefined;
}
