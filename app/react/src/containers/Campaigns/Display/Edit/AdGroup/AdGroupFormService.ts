import { AdGroupResource } from './../../../../../models/campaign/display/AdGroupResource';
import { omit } from 'lodash';
import {
  extractDataList,
  extractData,
} from '../../../../../services/ApiService';
import {
  AdGroupFormData,
  SegmentFieldModel,
  AdFieldModel,
  LocationFieldModel,
  PlacementListFieldModel,
  BidOptimizerFieldModel,
  isAudienceSegmentSelectionResource,
  isLocationSelectionResource,
  isPlacementListSelectionResource,
  INITIAL_AD_GROUP_FORM_DATA,
  isAdResource,
  isDisplayCreativeFormData,
} from './domain';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import {
  createFieldArrayModelWithMeta,
  createFieldArrayModel,
  Task,
  executeTasksInSequence,
} from '../../../../../utils/FormHelper';
import DisplayCreativeFormService from '../../../../Creative/DisplayAds/Edit/DisplayCreativeFormService';
import { EditAdGroupsFormData } from './MultiEdit/EditAdGroupsForm';
import operation from '../../Edit/AdGroup/domain';

type AdGroupId = string;

const AdGroupFormService = {
  loadAdGroup(
    displayCampaignId: string,
    adGroupId: string,
    duplicate?: boolean,
  ): Promise<AdGroupFormData> {
    return Promise.all([
      DisplayCampaignService.getAdGroup(displayCampaignId, adGroupId).then(
        extractData,
      ),
      AdGroupFormService.loadAdGroupDependencies(
        displayCampaignId,
        adGroupId,
        duplicate,
      ),
    ]).then(([adGroup, dependencies]) => {
      // bid optimizer is treated as a FieldArray
      const bidOptimizerFields: BidOptimizerFieldModel[] = [];
      if (adGroup.bid_optimizer_id) {
        bidOptimizerFields.push(
          createFieldArrayModel({ bid_optimizer_id: adGroup.bid_optimizer_id }),
        );
      }

      return {
        adGroup: duplicate ? omit(adGroup, 'id') : adGroup,
        ...dependencies,
        bidOptimizerFields,
      };
    });
  },

  loadAdGroupDependencies(
    displayCampaignId: string,
    adGroupId: string,
    duplicate?: boolean,
  ): Promise<{
    segmentFields: SegmentFieldModel[];
    adFields: AdFieldModel[];
    locationFields: LocationFieldModel[];
    placementListFields: PlacementListFieldModel[];
  }> {
    return Promise.all([
      DisplayCampaignService.getAudienceSegments(
        displayCampaignId,
        adGroupId,
      ).then(extractDataList),
      DisplayCampaignService.getAds(displayCampaignId, adGroupId).then(
        extractDataList,
      ),
      DisplayCampaignService.getLocations(displayCampaignId, adGroupId).then(
        extractDataList,
      ),
      DisplayCampaignService.getPlacementLists(
        displayCampaignId,
        adGroupId,
      ).then(extractDataList),
    ]).then(
      ([
        audienceSegmentSelections,
        adSelections,
        locarionSelections,
        placementListSelections,
      ]) => {
        const segmentFields = audienceSegmentSelections.map(el => ({
          ...createFieldArrayModelWithMeta(duplicate ? omit(el, 'id') : el, {
            name: el.name,
          }),
        }));
        const adFields = adSelections.map(el =>
          createFieldArrayModel(duplicate ? omit(el, 'id') : el),
        );
        const locationFields = locarionSelections.map(el =>
          createFieldArrayModel(duplicate ? omit(el, 'id') : el),
        );
        const placementListFields = placementListSelections.map(el => ({
          ...createFieldArrayModelWithMeta(duplicate ? omit(el, 'id') : el, {
            name: el.name,
          }),
        }));
        return {
          segmentFields,
          adFields,
          locationFields,
          placementListFields,
        };
      },
    );
  },

  saveAdGroup(
    organisationId: string,
    displayCampaignId: string,
    formData: AdGroupFormData,
    initialFormData: AdGroupFormData = INITIAL_AD_GROUP_FORM_DATA,
  ): Promise<AdGroupId> {
    updateBidOptimizer(formData);

    let createOrUpdatePromise;
    if (formData.adGroup.id) {
      createOrUpdatePromise = DisplayCampaignService.updateAdGroup(
        displayCampaignId,
        formData.adGroup.id,
        formData.adGroup,
      );
    } else {
      createOrUpdatePromise = DisplayCampaignService.createAdGroup(
        displayCampaignId,
        formData.adGroup,
      );
    }

    return createOrUpdatePromise.then(res => {
      const adGroupId = res.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getSegmentTasks(
          displayCampaignId,
          adGroupId,
          formData.segmentFields,
          initialFormData.segmentFields,
        ),
        ...getAdTasks(
          organisationId,
          displayCampaignId,
          adGroupId,
          formData.adFields,
          initialFormData.adFields,
        ),
        ...getLocationTasks(
          displayCampaignId,
          adGroupId,
          formData.locationFields,
          initialFormData.locationFields,
        ),
        ...getPlacementListTasks(
          displayCampaignId,
          adGroupId,
          formData.placementListFields,
          initialFormData.placementListFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => adGroupId);
    });
  },

  saveAdGroups(
    campaignId: string,
    adGroupIds: string[],
    formData: EditAdGroupsFormData,
  ) {
    const tasks: Task[] = [];
    adGroupIds.forEach(adGroupId => {
      tasks.push(() => {
        return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
          .then(apiRes => apiRes.data)
          .then((adGroupData: any) => {
            const updatedData = formData.fields.reduce((acc, field) => {
              const adGroupProperty: keyof AdGroupResource =
                field.adGroupProperty;
              return {
                ...acc,
                [field.adGroupProperty]: operation(
                  field.action,
                  adGroupData[adGroupProperty],
                  field.value,
                ),
              };
            }, {});
            return DisplayCampaignService.updateAdGroup(
              campaignId,
              adGroupId,
              updatedData,
            );
          });
      });
    });
    return executeTasksInSequence(tasks);
  },
};

export default AdGroupFormService;

function updateBidOptimizer(adGroupFormData: AdGroupFormData) {
  const bidOptimizerId =
    adGroupFormData.bidOptimizerFields[0] &&
    adGroupFormData.bidOptimizerFields[0].model.bid_optimizer_id;
  adGroupFormData.adGroup.bid_optimizer_id = bidOptimizerId;
}

function getSegmentTasks(
  campaignId: string,
  adGroupId: string,
  segmentFields: SegmentFieldModel[],
  initialSegmentFields: SegmentFieldModel[],
): Task[] {
  const initialIds: string[] = [];
  initialSegmentFields.forEach(field => {
    if (isAudienceSegmentSelectionResource(field.model)) {
      initialIds.push(field.model.id);
    }
  });
  const currentIds: string[] = [];
  segmentFields.forEach(field => {
    if (isAudienceSegmentSelectionResource(field.model)) {
      currentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  segmentFields.forEach(field => {
    if (isAudienceSegmentSelectionResource(field.model)) {
      const id = field.model.id;
      tasks.push(() =>
        DisplayCampaignService.updateAudienceSegment(
          campaignId,
          adGroupId,
          id,
          field.model,
        ),
      );
    } else {
      tasks.push(() =>
        DisplayCampaignService.createAudienceSegment(
          campaignId,
          adGroupId,
          field.model,
        ),
      );
    }
  });
  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteAudienceSegment(campaignId, adGroupId, id),
    );
  });
  return tasks;
}

function getLocationTasks(
  campaignId: string,
  adGroupId: string,
  locationFields: LocationFieldModel[],
  initialLocationFields: LocationFieldModel[],
): Task[] {
  const initialIds: string[] = [];
  initialLocationFields.forEach(field => {
    if (isLocationSelectionResource(field.model)) {
      initialIds.push(field.model.id);
    }
  });
  const currentIds: string[] = [];
  locationFields.forEach(field => {
    if (isLocationSelectionResource(field.model)) {
      currentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  locationFields.forEach(field => {
    if (isLocationSelectionResource(field.model)) {
      const id = field.model.id;
      tasks.push(() =>
        DisplayCampaignService.updateLocation(
          campaignId,
          adGroupId,
          id,
          field.model,
        ),
      );
    } else {
      tasks.push(() =>
        DisplayCampaignService.createLocation(
          campaignId,
          adGroupId,
          field.model,
        ),
      );
    }
  });
  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteLocation(campaignId, adGroupId, id),
    );
  });
  return tasks;
}

function getPlacementListTasks(
  campaignId: string,
  adGroupId: string,
  placementListFields: PlacementListFieldModel[],
  initialPlacementListFields: PlacementListFieldModel[],
): Task[] {
  const initialIds: string[] = [];
  initialPlacementListFields.forEach(field => {
    if (isPlacementListSelectionResource(field.model)) {
      initialIds.push(field.model.id);
    }
  });
  const currentIds: string[] = [];
  placementListFields.forEach(field => {
    if (isPlacementListSelectionResource(field.model)) {
      currentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  placementListFields.forEach(field => {
    if (isPlacementListSelectionResource(field.model)) {
      const id = field.model.id;
      tasks.push(() =>
        DisplayCampaignService.updatePlacementList(
          campaignId,
          adGroupId,
          id,
          field.model,
        ),
      );
    } else {
      tasks.push(() =>
        DisplayCampaignService.createPlacementList(
          campaignId,
          adGroupId,
          field.model,
        ),
      );
    }
  });
  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deletePlacementList(campaignId, adGroupId, id),
    );
  });
  return tasks;
}

function getAdTasks(
  organisationId: string,
  campaignId: string,
  adGroupId: string,
  adFields: AdFieldModel[],
  initialAdFields: AdFieldModel[],
): Task[] {
  const initialIds: string[] = [];
  initialAdFields.forEach(field => {
    if (isAdResource(field.model)) {
      initialIds.push(field.model.id);
    }
  });
  const currentIds: string[] = [];
  adFields.forEach(field => {
    if (isAdResource(field.model)) {
      currentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  adFields.forEach(field => {
    if (isDisplayCreativeFormData(field.model)) {
      const creativeFormData = field.model;
      tasks.push(() =>
        DisplayCreativeFormService.saveDisplayCreative(
          organisationId,
          creativeFormData,
        ).then(creativeId => {
          return DisplayCampaignService.createAd(campaignId, adGroupId, {
            creative_id: creativeId,
          });
        }),
      );
    } else if (!isAdResource(field.model)) {
      const adCreateRequest = field.model;
      tasks.push(() =>
        DisplayCampaignService.createAd(campaignId, adGroupId, {
          creative_id: adCreateRequest.creative_id,
        }),
      );
    }
  });

  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteAd(campaignId, adGroupId, id),
    );
  });
  return tasks;
}
