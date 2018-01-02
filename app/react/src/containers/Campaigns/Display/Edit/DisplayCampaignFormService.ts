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

type TDisplayCampaignId = string;

const DisplayCampaignFormService = {
  loadCampaign(displayCampaignId: string): Promise<DisplayCampaignFormData> {
    return Promise.all([
      DisplayCampaignService.getCampaignDisplay(displayCampaignId).then(
        extractData,
      ),
      DisplayCampaignFormService.loadCampaignDependencies(displayCampaignId),
    ]).then(([campaign, dependencies]) => {
      return {
        campaign,
        ...dependencies,
      };
    });
  },

  loadCampaignDependencies(
    displayCampaignId: string,
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
            );
          }),
        );
      }),
    ]).then(([goalSelections, adGroupFormDataList]) => {
      const goalFields = goalSelections.map(el => ({
        ...createFieldArrayModelWithMeta(el, { name: el.goal_name }),
      }));
      const adGroupFields = adGroupFormDataList.map(el =>
        createFieldArrayModel(el),
      );
      return {
        goalFields,
        adGroupFields,
      };
    });
  },

  saveCampaign(
    organisationId: string,
    formData: DisplayCampaignFormData,
    initialFormData: DisplayCampaignFormData = INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
  ): Promise<TDisplayCampaignId> {
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
      );
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
        ),
        ...getAdGroupTasks(
          campaignId,
          formData.adGroupFields,
          initialFormData.adGroupFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => campaignId);
    });
  },
};

export default DisplayCampaignFormService;

function getGoalTasks(
  organisationId: string,
  campaignId: string,
  goalFields: GoalFieldModel[],
  initialGoalFields: GoalFieldModel[],
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
      tasks.push(() => {
        return GoalFormService.saveGoal(organisationId, goalFormData).then(
          goalId => {
            return DisplayCampaignService.createGoal(campaignId, {
              goal_id: goalId,
            });
          },
        );
      });
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
    tasks.push(() => AdGroupFormService.saveAdGroup(campaignId, field.model));
  });

  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
    tasks.push(() => DisplayCampaignService.deleteAdGroup(campaignId, id));
  });

  return tasks;
}
