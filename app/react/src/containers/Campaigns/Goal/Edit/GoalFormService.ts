import { GoalFormData, isGoalResource, LookbackWindow } from './domain';
import {
  AttributionModelResource,
  AttributionSelectionResource,
  GoalResource
} from '../../../../models/goal';
import { IntPropertyResource } from '../../../../models/plugin';
import GoalService from '../../../../services/GoalService';
import AttributionModelService from '../../../../services/AttributionModelService';

const LookbackWindowArtifactId = 'lookback_window';

const GoalFormService = {
  loadGoal(goalId: string): Promise<GoalFormData> {
    return Promise.all([
      GoalService.getGoal(goalId).then(res => res.data),
      getLookbackWindow(goalId),
    ]).then(([goal, lookbackWindow]) => {
      return {
        goal,
        lookbackWindow,
      };
    });
  },

  saveGoal(
    organisationId: string,
    goalFormData: GoalFormData,
  ): Promise<GoalResource> {
    let createOrUpdateGoalPromise;
    if (goalFormData.goal && isGoalResource(goalFormData.goal)) {
      createOrUpdateGoalPromise = GoalService.updateGoal(
        goalFormData.goal.id,
        goalFormData.goal,
      );
    } else {
      createOrUpdateGoalPromise = GoalService.createGoal(
        organisationId,
        goalFormData.goal,
      );
    }

    return createOrUpdateGoalPromise.then(resp => {
      const goalResource = resp.data;
      if (goalFormData.lookbackWindow) {
        return persistLookbackWindow(
          organisationId,
          goalResource.id,
          goalFormData.lookbackWindow,
        ).then(() => goalResource);
      }
      return goalResource;
    });
  },
};

export default GoalFormService;

function getLookbackWindow(
  goalId: string,
): Promise<LookbackWindow | undefined> {
  const noLookbackWindow = undefined;
  return GoalService.getAttributionModels(goalId).then(res => {
    const lookbackWindowFound = res.data.find(
      ats => ats.artifact_id === LookbackWindowArtifactId && ats.default,
    );
    if (!lookbackWindowFound) {
      return noLookbackWindow;
    }
    return AttributionModelService.getAttributionModelProperties(
      lookbackWindowFound.attribution_model_id,
    ).then(propsRes => {
      const postViewProp = propsRes.data.find(
        prop => prop.technical_name === 'post_view',
      );
      const postClickProp = propsRes.data.find(
        prop => prop.technical_name === 'post_click',
      );
      if (!postViewProp && !postClickProp) return noLookbackWindow;
      return {
        postView: (postViewProp as IntPropertyResource).value.value,
        postClick: (postClickProp as IntPropertyResource).value.value,
      };
    });
  });
}

function persistLookbackWindow(
  organisationId: string,
  goalId: string,
  lookbackWindow: LookbackWindow,
): Promise<AttributionSelectionResource> {
  return getOrCreateLookbackWindowAttributionModel(
    organisationId,
    lookbackWindow,
  ).then(lpAttributionModel => {
    return GoalService.createAttributionModel(goalId, {
      attribution_model_id: lpAttributionModel.id,
      attribution_type: 'WITH_PROCESSOR',
      default: true,
    }).then(res => res.data);
  });
}

function getOrCreateLookbackWindowAttributionModel(
  organisationId: string,
  lookbackWindow: LookbackWindow,
): Promise<AttributionModelResource> {
  const predefinedAttributionModelName = `PV${lookbackWindow.postView}PC${
    lookbackWindow.postClick
  }`;
  return AttributionModelService.getAttributionModels(organisationId).then(
    resp => {
      const found = resp.data.find(
        model =>
          model.name === predefinedAttributionModelName &&
          model.artifact_id === LookbackWindowArtifactId,
      );

      if (!found) {
        return AttributionModelService.createAttributionModel(organisationId, {
          artifact_id: LookbackWindowArtifactId,
          group_id: 'com.mediarithmics.attribution',
          mode: 'DISCOVERY',
          name: predefinedAttributionModelName,
        }).then(res => {
          const newLookbackWindowAttributionModel = res.data;
          return Promise.all([
            AttributionModelService.updateAttributionProperty(
              newLookbackWindowAttributionModel.id,
              'post_view',
              lookbackWindow.postView,
            ),
            AttributionModelService.updateAttributionProperty(
              newLookbackWindowAttributionModel.id,
              'post_click',
              lookbackWindow.postClick,
            ),
          ]).then(() => newLookbackWindowAttributionModel);
        });
      }

      return found;
    },
  );
}
