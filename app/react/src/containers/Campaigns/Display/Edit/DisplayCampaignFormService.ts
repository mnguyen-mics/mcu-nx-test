import {
  INITIAL_GOAL_FORM_DATA,
  isExistingGoal,
} from './../../Goal/Edit/domain';
import { DisplayCampaignResource } from './../../../../models/campaign/display/DisplayCampaignResource';
import { omit } from 'lodash';
import { extractDataList, extractData } from '../../../../services/ApiService';
import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import {
  createFieldArrayModelWithMeta,
  createFieldArrayModel,
  Task,
  executeTasksInSequence,
} from '../../../../utils/FormHelper';
import {
  DisplayCampaignFormData,
  GoalFieldModel,
  AdGroupFieldModel,
  INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
  isGoalFormData,
  isGoalSelectionResource,
} from './domain';
import AdGroupFormService from './AdGroup/AdGroupFormService';
import GoalFormService from '../../Goal/Edit/GoalFormService';
import { EditCampaignsFormData } from './Campaign/MutiEdit/EditCampaignsForm';
import operation from '../Edit/Campaign/domain';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import GoalService from '../../../../services/GoalService';

type DisplayCampaignId = string;

const DisplayCampaignFormService = {
  loadCampaign(
    displayCampaignId: string,
    duplicate?: boolean,
  ): Promise<DisplayCampaignFormData> {
    return Promise.all([
      DisplayCampaignService.getCampaignDisplay(displayCampaignId).then(
        extractData,
      ),
      DisplayCampaignFormService.loadCampaignDependencies(
        displayCampaignId,
        duplicate,
      ),
    ]).then(([campaign, dependencies]) => {
      return {
        campaign: duplicate ? omit(campaign, 'id') : campaign,
        ...dependencies,
      };
    });
  },

  loadCampaignDependencies(
    displayCampaignId: string,
    duplicate?: boolean,
  ): Promise<{
    goalFields: GoalFieldModel[];
    adGroupFields: AdGroupFieldModel[];
  }> {
    return Promise.all([
      DisplayCampaignService.getGoals(displayCampaignId).then(extractDataList),
      DisplayCampaignService.getAdGroups(displayCampaignId).then(res => {
        return Promise.all(
          res.data.map(adGroup => {
            return AdGroupFormService.loadAdGroup(
              displayCampaignId,
              adGroup.id,
              duplicate,
            );
          }),
        );
      }),
    ]).then(([goalSelections, adGroupFormDataList]) => {
      const goalFields: GoalFieldModel[] = [];
      const tasks: Task[] = [];
      goalSelections.forEach(el => {
        tasks.push(() => {
          return GoalService.getGoal(el.goal_id)
            .then(resp => resp.data)
            .then(goalResource => {
              goalFields.push({
                ...createFieldArrayModelWithMeta(
                  duplicate ? omit(el, 'id') : el,
                  {
                    name: el.goal_name,
                    triggerMode: goalResource.new_query_id ? 'QUERY' : 'PIXEL',
                  },
                ),
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
  },

  saveCampaign(
    organisationId: string,
    formData: DisplayCampaignFormData,
    initialFormData: DisplayCampaignFormData = INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
    datamartId?: string,
  ): Promise<DisplayCampaignId> {
    let createOrUpdatePromise;

    if (formData.campaign.id) {
      createOrUpdatePromise = DisplayCampaignService.updateCampaign(
        formData.campaign.id,
        formData.campaign,
      );
    } else {
      createOrUpdatePromise = DisplayCampaignService.createCampaign(
        organisationId,
        formData.campaign,
      ).then(res => {
        return datamartId
          ? executeTasksInSequence(
              getExposedClickersTasks(organisationId, res.data.id, datamartId),
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
        ...getGoalTasks(
          organisationId,
          campaignId,
          formData.goalFields,
          initialFormData.goalFields,
          datamartId,
        ),
        ...getAdGroupTasks(
          organisationId,
          campaignId,
          formData.adGroupFields,
          initialFormData.adGroupFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => campaignId);
    });
  },

  saveCampaigns(campaignIds: string[], formData: EditCampaignsFormData) {
    const tasks: Task[] = [];
    campaignIds.forEach(campaignId => {
      tasks.push(() => {
        return DisplayCampaignService.getCampaignDisplay(campaignId)
          .then(apiRes => apiRes.data)
          .then((campaignData: any) => {
            const updatedData = formData.fields.reduce((acc, field) => {
              const campaignProperty: keyof DisplayCampaignResource =
                field.campaignProperty;
              return {
                ...acc,
                [field.campaignProperty]: operation(
                  field.action,
                  campaignData[campaignProperty],
                  field.value,
                ),
              };
            }, {});
            return DisplayCampaignService.updateCampaign(
              campaignId,
              updatedData,
            );
          });
      });
    });
    return executeTasksInSequence(tasks);
  },
};

export default DisplayCampaignFormService;

function getExposedClickersTasks(
  organisationId: string,
  campaignId: string,
  datamartId: string,
): Task[] {
  return [
    () =>
      AudienceSegmentService.createAudienceSegment(organisationId, {
        campaign_id: campaignId,
        clickers: false,
        datamart_id: datamartId,
        exposed: true,
        type: 'USER_ACTIVATION',
      }),
    () =>
      AudienceSegmentService.createAudienceSegment(organisationId, {
        campaign_id: campaignId,
        clickers: true,
        datamart_id: datamartId,
        exposed: false,
        type: 'USER_ACTIVATION',
      }),
  ];
}

function getGoalTasks(
  organisationId: string,
  campaignId: string,
  goalFields: GoalFieldModel[],
  initialGoalFields: GoalFieldModel[],
  datamartId?: string,
): Task[] {
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
          return GoalFormService.loadGoalData(goalFormData.goal.id);
        }
        return Promise.resolve(INITIAL_GOAL_FORM_DATA);
      };

      tasks.push(() =>
        fetchGoalInitialFormData().then(initialGoalFormData => {
          return GoalFormService.saveGoal(
            organisationId,
            goalFormData,
            initialGoalFormData,
          ).then(goalResource => {
            return DisplayCampaignService.createGoal(campaignId, {
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
        DisplayCampaignService.createGoal(
          campaignId,
          goalSelectionCreateRequest,
        ),
      );
    }
  });

  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() => DisplayCampaignService.deleteGoal(campaignId, id));
  });

  return tasks;
}

function getAdGroupTasks(
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
      AdGroupFormService.saveAdGroup(
        organisationId,
        campaignId,
        field.model,
        initialField ? initialField.model : undefined,
      ),
    );
  });

  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() => DisplayCampaignService.deleteAdGroup(campaignId, id));
  });

  return tasks;
}
