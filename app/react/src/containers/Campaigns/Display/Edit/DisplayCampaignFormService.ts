import { IDisplayCampaignService } from './../../../../services/DisplayCampaignService';
import { INITIAL_GOAL_FORM_DATA, isExistingGoal } from './../../Goal/Edit/domain';
import { DisplayCampaignResource } from './../../../../models/campaign/display/DisplayCampaignResource';
import { omit } from 'lodash';
import { extractDataList, extractData } from '../../../../services/ApiService';
import { createFieldArrayModelWithMeta, createFieldArrayModel } from '../../../../utils/FormHelper';
import { Task, executeTasksInSequence } from '../../../../utils/PromiseHelper';
import {
  DisplayCampaignFormData,
  GoalFieldModel,
  AdGroupFieldModel,
  INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
  isGoalFormData,
  isGoalSelectionResource,
} from './domain';
import { IAdGroupFormService } from './AdGroup/AdGroupFormService';
import { EditCampaignsFormData } from './Campaign/MutiEdit/EditCampaignsForm';
import operation from '../Edit/Campaign/domain';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../constants/types';
import { IGoalFormService } from '../../Goal/Edit/GoalFormService';
import { INITIAL_AD_GROUP_FORM_DATA } from './AdGroup/domain';
import { IGoalService } from '../../../../services/GoalService';

type DisplayCampaignId = string;

export interface IDisplayCampaignFormService {
  loadCampaign: (
    displayCampaignId: string,
    duplicate?: boolean,
  ) => Promise<DisplayCampaignFormData>;

  loadCampaignDependencies: (
    displayCampaignId: string,
    duplicate?: boolean,
  ) => Promise<{
    goalFields: GoalFieldModel[];
    adGroupFields: AdGroupFieldModel[];
  }>;

  saveCampaign: (
    organisationId: string,
    formData: DisplayCampaignFormData,
    initialFormData: DisplayCampaignFormData,
    datamartId?: string,
  ) => Promise<DisplayCampaignId>;

  saveCampaigns: (campaignIds: string[], formData: EditCampaignsFormData) => Promise<any>;
}

@injectable()
export class DisplayCampaignFormService implements IDisplayCampaignFormService {
  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @inject(TYPES.IGoalFormService)
  private _goalFormService: IGoalFormService;

  @inject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @inject(TYPES.IAdGroupFormService)
  private _adGroupFormService: IAdGroupFormService;

  @inject(TYPES.IGoalService)
  private _goalService: IGoalService;

  loadCampaign(displayCampaignId: string, duplicate?: boolean): Promise<DisplayCampaignFormData> {
    return Promise.all([
      this._displayCampaignService.getCampaignDisplay(displayCampaignId).then(extractData),
      this.loadCampaignDependencies(displayCampaignId, duplicate),
    ]).then(([campaign, dependencies]) => {
      return {
        campaign: duplicate ? omit(campaign, 'id') : campaign,
        ...dependencies,
      };
    });
  }

  loadCampaignDependencies(
    displayCampaignId: string,
    duplicate?: boolean,
  ): Promise<{
    goalFields: GoalFieldModel[];
    adGroupFields: AdGroupFieldModel[];
  }> {
    return Promise.all([
      this._displayCampaignService.getGoals(displayCampaignId).then(extractDataList),
      this._displayCampaignService.getAdGroups(displayCampaignId).then(res => {
        return Promise.all(
          res.data.map(adGroup => {
            return this._adGroupFormService.loadAdGroup(displayCampaignId, adGroup.id, duplicate);
          }),
        );
      }),
    ]).then(([goalSelections, adGroupFormDataList]) => {
      const goalFields: GoalFieldModel[] = [];
      const tasks: Task[] = [];
      goalSelections.forEach(el => {
        tasks.push(() => {
          return this._goalService
            .getGoal(el.goal_id)
            .then(resp => resp.data)
            .then(goalResource => {
              goalFields.push({
                ...createFieldArrayModelWithMeta(duplicate ? omit(el, 'id') : el, {
                  name: el.goal_name,
                  triggerMode: goalResource.new_query_id ? 'QUERY' : 'PIXEL',
                }),
              });
            });
        });
      });
      return executeTasksInSequence(tasks).then(() => {
        const adGroupFields = adGroupFormDataList.map(el =>
          createFieldArrayModel(duplicate ? omit(el, 'id') : el),
        );
        return {
          goalFields,
          adGroupFields,
        };
      });
    });
  }

  saveCampaign(
    organisationId: string,
    formData: DisplayCampaignFormData,
    initialFormData: DisplayCampaignFormData = INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
    datamartId?: string,
  ): Promise<DisplayCampaignId> {
    let createOrUpdatePromise;

    if (formData.campaign.id) {
      createOrUpdatePromise = this._displayCampaignService.updateCampaign(
        formData.campaign.id,
        formData.campaign,
      );
    } else {
      createOrUpdatePromise = this._displayCampaignService
        .createCampaign({ ...formData.campaign, organisation_id: organisationId })
        .then(res => {
          return datamartId
            ? executeTasksInSequence(
                this.getExposedClickersTasks(organisationId, res.data.id, datamartId),
              ).then(() => {
                return res;
              })
            : res;
        });
    }

    return createOrUpdatePromise.then(res => {
      const campaignId = res.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...this.getGoalTasks(
          organisationId,
          campaignId,
          formData.goalFields,
          initialFormData.goalFields,
          datamartId,
        ),
        ...this.getAdGroupTasks(
          organisationId,
          campaignId,
          formData.adGroupFields,
          initialFormData.adGroupFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => campaignId);
    });
  }

  saveCampaigns(campaignIds: string[], formData: EditCampaignsFormData) {
    const tasks: Task[] = [];
    campaignIds.forEach(campaignId => {
      tasks.push(() => {
        return this._displayCampaignService
          .getCampaignDisplay(campaignId)
          .then(apiRes => apiRes.data)
          .then((campaignData: any) => {
            const updatedData = formData.fields.reduce((acc, field) => {
              const campaignProperty: keyof DisplayCampaignResource = field.campaignProperty;
              return {
                ...acc,
                [field.campaignProperty]: operation(
                  field.action,
                  campaignData[campaignProperty],
                  field.value,
                ),
              };
            }, {});
            return this._displayCampaignService.updateCampaign(campaignId, updatedData);
          });
      });
    });
    return executeTasksInSequence(tasks);
  }
  getExposedClickersTasks = (
    organisationId: string,
    campaignId: string,
    datamartId: string,
  ): Task[] => {
    return [
      () =>
        this._audienceSegmentService.createAudienceSegment(organisationId, {
          campaign_id: campaignId,
          clickers: false,
          datamart_id: datamartId,
          exposed: true,
          type: 'USER_ACTIVATION',
        }),
      () =>
        this._audienceSegmentService.createAudienceSegment(organisationId, {
          campaign_id: campaignId,
          clickers: true,
          datamart_id: datamartId,
          exposed: false,
          type: 'USER_ACTIVATION',
        }),
    ];
  };
  getGoalTasks = (
    organisationId: string,
    campaignId: string,
    goalFields: GoalFieldModel[],
    initialGoalFields: GoalFieldModel[],
    datamartId?: string,
  ): Task[] => {
    const initialIds: string[] = [];
    initialGoalFields.forEach(field => {
      if (isGoalSelectionResource(field.model)) {
        initialIds.push(field.model.id);
      }
    });

    const currentIds: string[] = [];
    goalFields.forEach(field => {
      if (isGoalSelectionResource(field.model)) {
        currentIds.push(field.model.id);
      }
    });

    const tasks: Task[] = [];
    goalFields.forEach(field => {
      if (isGoalFormData(field.model)) {
        const goalFormData = field.model;

        const fetchGoalInitialFormData = () => {
          if (isExistingGoal(goalFormData.goal)) {
            return this._goalFormService.loadGoalData(goalFormData.goal.id);
          }
          return Promise.resolve(INITIAL_GOAL_FORM_DATA);
        };

        tasks.push(() =>
          fetchGoalInitialFormData().then(initialGoalFormData => {
            return this._goalFormService
              .saveGoal(organisationId, goalFormData, initialGoalFormData)
              .then(goalResource => {
                return this._displayCampaignService.createGoal(campaignId, {
                  goal_id: goalResource.id,
                  goal_selection_type: 'CONVERSION',
                  default: true,
                });
              });
          }),
        );
      } else if (!isGoalSelectionResource(field.model)) {
        const goalSelectionCreateRequest = field.model;
        tasks.push(() =>
          this._displayCampaignService.createGoal(campaignId, goalSelectionCreateRequest),
        );
      }
    });

    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._displayCampaignService.deleteGoal(campaignId, id));
      });

    return tasks;
  };

  getAdGroupTasks(
    organisationId: string,
    campaignId: string,
    adGroupFields: AdGroupFieldModel[],
    initialAdGroupFields: AdGroupFieldModel[],
  ): Task[] {
    const initialIds: string[] = [];
    initialAdGroupFields.forEach(field => {
      if (field.model.adGroup.id) {
        initialIds.push(field.model.adGroup.id);
      }
    });

    const currentIds: string[] = [];
    adGroupFields.forEach(field => {
      if (field.model.adGroup.id) {
        currentIds.push(field.model.adGroup.id);
      }
    });

    const tasks: Task[] = [];
    adGroupFields.forEach(field => {
      const initialField = initialAdGroupFields.find(f => f.key === field.key);
      tasks.push(() =>
        this._adGroupFormService.saveAdGroup(
          organisationId,
          campaignId,
          field.model,
          initialField ? initialField.model : INITIAL_AD_GROUP_FORM_DATA,
        ),
      );
    });

    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._displayCampaignService.deleteAdGroup(campaignId, id));
      });

    return tasks;
  }
}
