import { IDisplayCampaignService } from './../../../../../services/DisplayCampaignService';
import { IDisplayCreativeFormService } from './../../../../Creative/DisplayAds/Edit/DisplayCreativeFormService';
import { AdGroupResource } from './../../../../../models/campaign/display/AdGroupResource';
import { omit } from 'lodash';
import {
  AdGroupFormData,
  AdFieldModel,
  LocationFieldModel,
  isAudienceSegmentSelectionResource,
  isLocationSelectionResource,
  INITIAL_AD_GROUP_FORM_DATA,
  isAdResource,
  isDisplayCreativeFormData,
  InventoryCatalFieldsModel,
  SegmentFieldModel,
  isAdExchangeSelectionResource,
  isDisplayNetworkSelectionResource,
} from './domain';
import {
  createFieldArrayModelWithMeta,
  createFieldArrayModel,
} from '../../../../../utils/FormHelper';
import { Task, executeTasksInSequence } from '../../../../../utils/PromiseHelper';
import { EditAdGroupsFormData } from './MultiEdit/EditAdGroupsForm';
import operation from '../../Edit/AdGroup/domain';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../../constants/types';
import { extractData, extractDataList } from '../../../../../utils/ApiHelper';

type AdGroupId = string;

export interface IAdGroupFormService {
  loadAdGroup: (
    displayCampaignId: string,
    adGroupId: string,
    duplicate?: boolean,
  ) => Promise<AdGroupFormData>;

  loadAdGroupDependencies: (
    displayCampaignId: string,
    adGroupId: string,
    duplicate?: boolean,
  ) => Promise<{
    segmentFields: SegmentFieldModel[];
    adFields: AdFieldModel[];
    locationFields: LocationFieldModel[];
    inventoryCatalFields: InventoryCatalFieldsModel[];
  }>;
  saveAdGroup: (
    organisationId: string,
    displayCampaignId: string,
    formData: AdGroupFormData,
    initialFormData: AdGroupFormData,
  ) => Promise<AdGroupId>;

  saveAdGroups: (
    campaignId: string,
    adGroupIds: string[],
    formData: EditAdGroupsFormData,
  ) => Promise<any>;
  getAdTasks(
    organisationId: string,
    campaignId: string,
    adGroupId: string,
    adFields: AdFieldModel[],
    initialAdFields: AdFieldModel[],
  ): Task[];
}

@injectable()
export class AdGroupFormService implements IAdGroupFormService {
  @inject(TYPES.IDisplayCreativeFormService)
  private _displayCreativeFormService: IDisplayCreativeFormService;

  @inject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  loadAdGroup(
    displayCampaignId: string,
    adGroupId: string,
    duplicate?: boolean,
  ): Promise<AdGroupFormData> {
    return Promise.all([
      this._displayCampaignService.getAdGroup(displayCampaignId, adGroupId).then(extractData),
      this.loadAdGroupDependencies(displayCampaignId, adGroupId, duplicate),
    ]).then(([adGroup, dependencies]) => {
      return {
        adGroup: {
          ...INITIAL_AD_GROUP_FORM_DATA.adGroup,
          ...(duplicate ? omit(adGroup, 'id') : adGroup),
        },
        ...dependencies,
      };
    });
  }

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
      this._displayCampaignService
        .getAudienceSegments(displayCampaignId, adGroupId)
        .then(extractDataList),
      this._displayCampaignService.getAds(displayCampaignId, adGroupId).then(extractDataList),
      this._displayCampaignService.getLocations(displayCampaignId, adGroupId).then(extractDataList),
      this._displayCampaignService.getAdex(displayCampaignId, adGroupId).then(extractDataList),
      this._displayCampaignService
        .getDisplayNetworks(displayCampaignId, adGroupId)
        .then(extractDataList),
    ]).then(
      ([
        audienceSegmentSelections,
        adSelections,
        locarionSelections,
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

        const inventoryCatalFields = [...displayNetworkFields, ...adExchangeFields];

        return {
          segmentFields,
          adFields,
          locationFields,
          inventoryCatalFields,
        };
      },
    );
  }

  saveAdGroup(
    organisationId: string,
    displayCampaignId: string,
    formData: AdGroupFormData,
    initialFormData: AdGroupFormData = INITIAL_AD_GROUP_FORM_DATA,
  ): Promise<AdGroupId> {
    let createOrUpdatePromise;
    if (formData.adGroup.id) {
      createOrUpdatePromise = this._displayCampaignService.updateAdGroup(
        displayCampaignId,
        formData.adGroup.id,
        formData.adGroup,
      );
    } else {
      createOrUpdatePromise = this._displayCampaignService.createAdGroup(
        displayCampaignId,
        formData.adGroup,
      );
    }

    return createOrUpdatePromise.then(res => {
      const adGroupId = res.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...this.getSegmentTasks(
          displayCampaignId,
          adGroupId,
          formData.segmentFields,
          initialFormData.segmentFields,
        ),
        ...this.getAdTasks(
          organisationId,
          displayCampaignId,
          adGroupId,
          formData.adFields,
          initialFormData.adFields,
        ),
        ...this.getLocationTasks(
          displayCampaignId,
          adGroupId,
          formData.locationFields,
          initialFormData.locationFields,
        ),
        ...this.getInventoryCatalogTask(
          displayCampaignId,
          adGroupId,
          formData.inventoryCatalFields,
          initialFormData.inventoryCatalFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => adGroupId);
    });
  }

  saveAdGroups(campaignId: string, adGroupIds: string[], formData: EditAdGroupsFormData) {
    const tasks: Task[] = [];
    adGroupIds.forEach(adGroupId => {
      tasks.push(() => {
        return this._displayCampaignService
          .getAdGroup(campaignId, adGroupId)
          .then(apiRes => apiRes.data)
          .then((adGroupData: any) => {
            const updatedData = formData.fields.reduce((acc, field) => {
              const adGroupProperty: keyof AdGroupResource = field.adGroupProperty;
              return {
                ...acc,
                [field.adGroupProperty]: operation(
                  field.action,
                  adGroupData[adGroupProperty],
                  field.value,
                ),
              };
            }, {});
            return this._displayCampaignService.updateAdGroup(campaignId, adGroupId, updatedData);
          });
      });
    });
    return executeTasksInSequence(tasks);
  }

  getAdTasks(
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
        };
        tasks.push(() =>
          this._displayCreativeFormService
            .saveDisplayCreative(organisationId, creativeFormData)
            .then(creativeId => {
              return this._displayCampaignService.createAd(campaignId, adGroupId, {
                creative_id: creativeId,
              });
            }),
        );
      } else if (!isAdResource(field.model)) {
        const adCreateRequest = field.model;
        tasks.push(() =>
          this._displayCampaignService.createAd(campaignId, adGroupId, {
            creative_id: adCreateRequest.creative_id,
          }),
        );
      }
    });

    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._displayCampaignService.deleteAd(campaignId, adGroupId, id));
      });
    return tasks;
  }

  getSegmentTasks(
    campaignId: string,
    adGroupId: string,
    segmentFields: SegmentFieldModel[],
    initialSegmentFields: SegmentFieldModel[],
  ) {
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
          this._displayCampaignService.updateAudienceSegment(
            campaignId,
            adGroupId,
            id,
            field.model,
          ),
        );
      } else {
        tasks.push(() =>
          this._displayCampaignService.createAudienceSegment(campaignId, adGroupId, field.model),
        );
      }
    });
    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() =>
          this._displayCampaignService.deleteAudienceSegment(campaignId, adGroupId, id),
        );
      });
    return tasks;
  }

  getLocationTasks(
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
          this._displayCampaignService.updateLocation(campaignId, adGroupId, id, field.model),
        );
      } else {
        tasks.push(() =>
          this._displayCampaignService.createLocation(campaignId, adGroupId, field.model),
        );
      }
    });
    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._displayCampaignService.deleteLocation(campaignId, adGroupId, id));
      });
    return tasks;
  }

  getInventoryCatalogTask(
    campaignId: string,
    adGroupId: string,
    inventoryCatalFields: InventoryCatalFieldsModel[],
    initialInventoryCatalFields: InventoryCatalFieldsModel[],
  ): Task[] {
    // get initial values
    const initialAdExchangeIds: string[] = [];
    const initialDisplayNetworkIds: string[] = [];

    initialInventoryCatalFields.forEach(field => {
      if (field.model.type === 'AD_EXCHANGE' && isAdExchangeSelectionResource(field.model.data)) {
        initialAdExchangeIds.push(field.model.data.id);
      }
      if (
        field.model.type === 'DISPLAY_NETWORK' &&
        isDisplayNetworkSelectionResource(field.model.data)
      ) {
        initialDisplayNetworkIds.push(field.model.data.id);
      }
    });

    // get current values
    const currentAdExchangeIds: string[] = [];
    const currentDisplayNetworkIds: string[] = [];

    inventoryCatalFields.forEach(field => {
      if (field.model.type === 'AD_EXCHANGE' && isAdExchangeSelectionResource(field.model.data)) {
        currentAdExchangeIds.push(field.model.data.id);
      }
      if (
        field.model.type === 'DISPLAY_NETWORK' &&
        isDisplayNetworkSelectionResource(field.model.data)
      ) {
        currentDisplayNetworkIds.push(field.model.data.id);
      }
    });

    const tasks: Task[] = [];
    inventoryCatalFields.forEach(field => {
      if (field.model.type === 'AD_EXCHANGE') {
        const data = field.model.data;
        if (isAdExchangeSelectionResource(field.model.data)) {
          const id = field.model.data.id;
          tasks.push(() =>
            this._displayCampaignService.updateAdex(campaignId, adGroupId, id, data),
          );
        } else {
          tasks.push(() => this._displayCampaignService.createAdex(campaignId, adGroupId, data));
        }
      }

      if (field.model.type === 'DISPLAY_NETWORK') {
        const data = field.model.data;
        if (isDisplayNetworkSelectionResource(field.model.data)) {
          const id = field.model.data.id;
          tasks.push(() =>
            this._displayCampaignService.updateDisplayNetwork(campaignId, adGroupId, id, data),
          );
        } else {
          tasks.push(() =>
            this._displayCampaignService.createDisplayNetwork(campaignId, adGroupId, data),
          );
        }
      }
    });

    // delete requests
    initialAdExchangeIds
      .filter(id => !currentAdExchangeIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._displayCampaignService.deleteAdex(campaignId, adGroupId, id));
      });
    initialDisplayNetworkIds
      .filter(id => !currentDisplayNetworkIds.includes(id))
      .forEach(id => {
        tasks.push(() =>
          this._displayCampaignService.deleteDisplayNetwork(campaignId, adGroupId, id),
        );
      });
    return tasks;
  }
}

export default AdGroupFormService;
