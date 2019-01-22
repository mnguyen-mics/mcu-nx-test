import { AdGroupResource } from './../../../../../models/campaign/display/AdGroupResource';
import { omit } from 'lodash';
import {
  extractDataList,
  extractData,
} from '../../../../../services/ApiService';
import {
  AdGroupFormData,
  AdFieldModel,
  LocationFieldModel,
  BidOptimizerFieldModel,
  isAudienceSegmentSelectionResource,
  isLocationSelectionResource,
  INITIAL_AD_GROUP_FORM_DATA,
  isAdResource,
  isDisplayCreativeFormData,
  InventoryCatalFieldsModel,
  SegmentFieldModel,
  isDealListSelectionResource,
  isPlacementListSelectionResource,
  isKeywordListSelectionResource,
  isAdExchangeSelectionResource,
  isDisplayNetworkSelectionResource,
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
          createFieldArrayModel({ bid_optimizer_id: adGroup.bid_optimizer_id, bid_optimization_objective_type: adGroup.bid_optimization_objective_type, bid_optimization_objective_value: adGroup.bid_optimization_objective_value }),
        );
      }

      return {
        adGroup: {
          ...INITIAL_AD_GROUP_FORM_DATA.adGroup,
          ...(duplicate ? omit(adGroup, 'id') : adGroup)
        },
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
    inventoryCatalFields: InventoryCatalFieldsModel[];
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
      DisplayCampaignService.getKeywordList(displayCampaignId, adGroupId).then(
        extractDataList,
      ),
      DisplayCampaignService.getDealsLists(displayCampaignId, adGroupId).then(
        extractDataList,
      ),
      DisplayCampaignService.getAdex(displayCampaignId, adGroupId).then(
        extractDataList,
      ),
      DisplayCampaignService.getDisplayNetworks(
        displayCampaignId,
        adGroupId,
      ).then(extractDataList),
    ]).then(
      ([
        audienceSegmentSelections,
        adSelections,
        locarionSelections,
        placementListSelections,
        keywordListSelections,
        dealListSelections,
        adExchangeSelections,
        displayNetworkSelections,
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
       
        const placementListFields = placementListSelections.map(el => {
          const model = {
            data: duplicate ? omit(el, 'id') : el,
            type: 'PLACEMENT_LIST',
          };
          return createFieldArrayModelWithMeta(model, {
            name: el.name,
          });
        });

        const keywordListFields = keywordListSelections.map(el => {
          const model = {
            data: duplicate ? omit(el, 'id') : el,
            type: 'KEYWORD_LIST',
          };
          return createFieldArrayModelWithMeta(model, {
            name: el.name,
          });
        });

        const dealListFields = dealListSelections.map(el => {
          const model = {
            data: duplicate ? omit(el, 'id') : el,
            type: 'DEAL_LIST',
          };
          return createFieldArrayModelWithMeta(model, {
            name: el.name,
          });
        });

        const adExchangeFields = adExchangeSelections.map(el => {
          const model = {
            data: duplicate ? omit(el, 'id') : el,
            type: 'AD_EXCHANGE',
          };
          return createFieldArrayModelWithMeta(model, {
            name: el.name,
          });
        });

        const displayNetworkFields = displayNetworkSelections.map(el => {
          const model = {
            data: duplicate ? omit(el, 'id') : el,
            type: 'DISPLAY_NETWORK',
          };
          return createFieldArrayModelWithMeta(model, {
            name: el.name,
          });
        });


        

        const inventoryCatalFields = [
          ...displayNetworkFields,
          ...adExchangeFields,
          ...placementListFields,
          ...keywordListFields,
          ...dealListFields
        ];

        return {
          segmentFields,
          adFields,
          locationFields,
          inventoryCatalFields,
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
        ...getInventoryCatalogTask(
          displayCampaignId,
          adGroupId,
          formData.inventoryCatalFields,
          initialFormData.inventoryCatalFields,
        )
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
  const bidOptimizer =
    adGroupFormData.bidOptimizerFields[0] &&
    adGroupFormData.bidOptimizerFields[0].model;
  if (bidOptimizer) {
    adGroupFormData.adGroup.bid_optimizer_id = bidOptimizer.bid_optimizer_id;
    adGroupFormData.adGroup.bid_optimization_objective_type = bidOptimizer.bid_optimization_objective_type;
    adGroupFormData.adGroup.bid_optimization_objective_value = bidOptimizer.bid_optimization_objective_value;
  } else {
    adGroupFormData.adGroup.bid_optimizer_id = null;
    adGroupFormData.adGroup.bid_optimization_objective_type = null;
    adGroupFormData.adGroup.bid_optimization_objective_value = null;
  }
  
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

export function getLocationTasks(
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


export function getInventoryCatalogTask(
  campaignId: string,
  adGroupId: string,
  inventoryCatalFields: InventoryCatalFieldsModel[],
  initialInventoryCatalFields: InventoryCatalFieldsModel[],
): Task[] {

  // get initial values
  const initialDealListIds: string[] = [];
  const initialPlacementListIds: string[] = [];
  const initialKeywordListIds: string[] = [];
  const initialAdExchangeIds: string[] = [];
  const initialDisplayNetworkIds: string[] = [];


  initialInventoryCatalFields.forEach(field => {
    if (field.model.type === 'DEAL_LIST' && isDealListSelectionResource(field.model.data)) {
      initialDealListIds.push(field.model.data.id);
    }
    if (field.model.type === 'KEYWORD_LIST' && isKeywordListSelectionResource(field.model.data)) {
      initialKeywordListIds.push(field.model.data.id);
    }
    if (field.model.type === 'PLACEMENT_LIST' && isPlacementListSelectionResource(field.model.data)) {
      initialPlacementListIds.push(field.model.data.id);
    }
    if (field.model.type === 'AD_EXCHANGE' && isAdExchangeSelectionResource(field.model.data)) {
      initialAdExchangeIds.push(field.model.data.id)
    }
    if (field.model.type === 'DISPLAY_NETWORK' && isDisplayNetworkSelectionResource(field.model.data)) {
      initialDisplayNetworkIds.push(field.model.data.id)
    }
  });

  // get current values
  const currentDealListIds: string[] = [];
  const currentPlacementListIds: string[] = [];
  const currentKeywordListIds: string[] = [];
  const currentAdExchangeIds: string[] = [];
  const currentDisplayNetworkIds: string[] = [];

  inventoryCatalFields.forEach(field => {
    if (field.model.type === 'DEAL_LIST' && isDealListSelectionResource(field.model.data)) {
      currentDealListIds.push(field.model.data.id);
    }
    if (field.model.type === 'KEYWORD_LIST' && isKeywordListSelectionResource(field.model.data)) {
      currentKeywordListIds.push(field.model.data.id);
    }
    if (field.model.type === 'PLACEMENT_LIST' && isPlacementListSelectionResource(field.model.data)) {
      currentPlacementListIds.push(field.model.data.id);
    }
    if (field.model.type === 'AD_EXCHANGE' && isAdExchangeSelectionResource(field.model.data)) {
      currentAdExchangeIds.push(field.model.data.id)
    }
    if (field.model.type === 'DISPLAY_NETWORK' && isDisplayNetworkSelectionResource(field.model.data)) {
      currentDisplayNetworkIds.push(field.model.data.id)
    }
  });


  const tasks: Task[] = [];
  inventoryCatalFields.forEach(field => {
    if (field.model.type === 'DEAL_LIST') {
      const data = field.model.data;
      if (isDealListSelectionResource(field.model.data)) {
        const id = field.model.data.id;
        tasks.push(() => DisplayCampaignService.updateDealsList(
            campaignId,
            adGroupId,
            id,
            data,
          ),
        );
      } else {
        tasks.push(() => DisplayCampaignService.createDealsList(
            campaignId,
            adGroupId,
            data,
          ),
        );
      }
    }

    if (field.model.type === 'KEYWORD_LIST') {
      const data = field.model.data;
      if (isKeywordListSelectionResource(field.model.data)) {
        const id = field.model.data.id;
        tasks.push(() => DisplayCampaignService.updateKeywordList(
            campaignId,
            adGroupId,
            id,
            data,
          ),
        );
      } else {
        tasks.push(() => DisplayCampaignService.createKeywordList(
            campaignId,
            adGroupId,
            data,
          ),
        );
      }
    }

    if (field.model.type === 'PLACEMENT_LIST') {
      const data = field.model.data;
      if (isPlacementListSelectionResource(field.model.data)) {
        const id = field.model.data.id;
        tasks.push(() => DisplayCampaignService.updatePlacementList(
            campaignId,
            adGroupId,
            id,
            data,
          ),
        );
      } else {
        tasks.push(() => DisplayCampaignService.createPlacementList(
            campaignId,
            adGroupId,
            data,
          ),
        );
      }
    }

    if (field.model.type === 'AD_EXCHANGE') {
      const data = field.model.data;
      if (isAdExchangeSelectionResource(field.model.data)) {
        const id = field.model.data.id;
        tasks.push(() => DisplayCampaignService.updateAdex(
            campaignId,
            adGroupId,
            id,
            data,
          ),
        );
      } else {
        tasks.push(() => DisplayCampaignService.createAdex(
            campaignId,
            adGroupId,
            data,
          ),
        );
      }
    }

    if (field.model.type === 'DISPLAY_NETWORK') {
      const data = field.model.data;
      if (isDisplayNetworkSelectionResource(field.model.data)) {
        const id = field.model.data.id;
        tasks.push(() => DisplayCampaignService.updateDisplayNetwork(
            campaignId,
            adGroupId,
            id,
            data,
          ),
        );
      } else {
        tasks.push(() => DisplayCampaignService.createDisplayNetwork(
            campaignId,
            adGroupId,
            data,
          ),
        );
      }
    }

    
  })

  // delete requests
  initialDealListIds.filter(id => !currentDealListIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteDealsList(campaignId, adGroupId, id),
    );
  });
  initialKeywordListIds.filter(id => !currentKeywordListIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteKeywordList(campaignId, adGroupId, id),
    );
  });
  initialPlacementListIds.filter(id => !currentPlacementListIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deletePlacementList(campaignId, adGroupId, id),
    );
  });
  initialAdExchangeIds.filter(id => !currentAdExchangeIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteAdex(campaignId, adGroupId, id),
    );
  });
  initialDisplayNetworkIds.filter(id => !currentDisplayNetworkIds.includes(id)).forEach(id => {
    tasks.push(() =>
      DisplayCampaignService.deleteDisplayNetwork(campaignId, adGroupId, id),
    );
  });
  return tasks;
}



export function getAdTasks(
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
      let creativeFormData = field.model;
      creativeFormData = {
        ...creativeFormData,
        creative: {
          ...creativeFormData.creative,
          subtype: 'BANNER',
        },
      }
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
