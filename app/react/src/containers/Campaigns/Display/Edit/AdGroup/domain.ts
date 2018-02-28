import { AdGroupResource } from './../../../../../models/campaign/display/AdGroupResource';
import {
  FieldArrayModel,
  FieldArrayModelWithMeta,
} from '../../../../../utils/FormHelper';
import {
  AudienceSegmentSelectionResource,
  AudienceSegmentSelectionCreateRequest,
} from '../../../../../models/audiencesegment';
import {
  AdResource,
  AdCreateRequest,
} from '../../../../../models/campaign/display/AdResource';
import {
  PlacementListSelectionResource,
  PlacementListSelectionCreateRequest,
} from '../../../../../models/placement/PlacementListResource';
import {
  LocationSelectionResource,
  LocationSelectionCreateRequest,
} from '../AdGroup/sections/Location/domain';
import { DisplayCreativeFormData } from '../../../../Creative/DisplayAds/Edit/domain';
import { BidOptimizationObjectiveType } from '../../../../../models/campaign/constants';

export const AD_GROUP_FORM_NAME = 'adGroupForm';

export interface EditAdGroupRouteMatchParam {
  organisationId: string;
  campaignId: string;
  adGroupId?: string;
}

export type AdModelShape =
  | AdResource
  | AdCreateRequest
  | DisplayCreativeFormData;

export type AdFieldModel = FieldArrayModel<AdModelShape>;

export type AudienceSegmentSelectionShape =
  | AudienceSegmentSelectionResource
  | AudienceSegmentSelectionCreateRequest;

export type SegmentFieldModel = FieldArrayModelWithMeta<
  AudienceSegmentSelectionShape,
  { name: string }
>;

export type PlacementListSelectionShape =
  | PlacementListSelectionResource
  | PlacementListSelectionCreateRequest;

export type PlacementListFieldModel = FieldArrayModelWithMeta<
  PlacementListSelectionShape,
  { name: string }
>;

export type LocationSelectionShape =
  | LocationSelectionResource
  | LocationSelectionCreateRequest;

export type LocationFieldModel = FieldArrayModel<LocationSelectionShape>;

export type BidOptimizerFieldModel = FieldArrayModel<{
  bid_optimizer_id: string;
  bid_optimization_objective_type: BidOptimizationObjectiveType;
  bid_optimization_objective_value: string;
}>;

export interface AdGroupFormData {
  adGroup: Partial<AdGroupResource>;
  segmentFields: SegmentFieldModel[];
  adFields: AdFieldModel[];
  locationFields: LocationFieldModel[];
  placementListFields: PlacementListFieldModel[];
  bidOptimizerFields: BidOptimizerFieldModel[];
}

export const INITIAL_AD_GROUP_FORM_DATA: AdGroupFormData = {
  adGroup: {
    max_budget_period: 'DAY',
  },
  segmentFields: [],
  adFields: [],
  locationFields: [],
  placementListFields: [],
  bidOptimizerFields: [],
};

export type operationType = 'equals' | 'increase' | 'decrease';

export interface AdGroupsInfosFieldModel {
  adGroupProperty: keyof AdGroupResource;
  action?: operationType;
  value?: string;
}

const operationMap = {
  equals: (propertyValue: number, targetValue: number) => targetValue,
  increase: (propertyValue: number, percentValue: number) =>
    propertyValue + propertyValue * percentValue * 0.01,
  decrease: (propertyValue: number, percentValue: number) =>
    propertyValue - propertyValue * percentValue * 0.01,
};

const operation = (chosenOperation: operationType,
  propertyValue: number,
  targetValue: number,
) => {
  return operationMap[chosenOperation](propertyValue, targetValue);
};

export default operation;


///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isDisplayCreativeFormData(
  model: AdModelShape,
): model is DisplayCreativeFormData {
  return (
    (model as DisplayCreativeFormData).creative !== undefined &&
    (model as DisplayCreativeFormData).properties !== undefined
  );
}

export function isAdResource(model: AdModelShape): model is AdResource {
  return (
    (model as AdResource).id !== undefined &&
    (model as AdResource).creative_id !== undefined
  );
}

export function isAudienceSegmentSelectionResource(
  model: AudienceSegmentSelectionShape,
): model is AudienceSegmentSelectionResource {
  return (model as AudienceSegmentSelectionResource).id !== undefined;
}

export function isLocationSelectionResource(
  model: LocationSelectionShape,
): model is LocationSelectionResource {
  return (model as LocationSelectionResource).id !== undefined;
}

export function isPlacementListSelectionResource(
  model: PlacementListSelectionShape,
): model is PlacementListSelectionResource {
  return (model as PlacementListSelectionResource).id !== undefined;
}
