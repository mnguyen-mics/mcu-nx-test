import { GoalFormData, isGoalResource, LoopbackWindow } from './domain';
import {
  AttributionModelResource,
  AttributionSelectionResource,
} from '../../../../models/goal';
import { IntPropertyResource } from '../../../../models/plugin';
import GoalService from '../../../../services/GoalService';
import AttributionModelService from '../../../../services/AttributionModelService';

type TGoalId = string;
const LoopbackWindowArtifactId = 'loopback_window';

const GoalFormService = {
  loadGoal(goalId: string): Promise<GoalFormData> {
    return Promise.all([
      GoalService.getGoal(goalId).then(res => res.data),
      getLoopbackWindow(goalId),
    ]).then(([goal, loopbackWindow]) => {
      return {
        goal,
        loopbackWindow,
      };
    });
  },

  saveGoal(
    organisationId: string,
    goalFormData: GoalFormData,
  ): Promise<TGoalId> {
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
      const goalId = resp.data.id;
      if (goalFormData.loopbackWindow) {
        return persistLoopbackWindow(
          organisationId,
          goalId,
          goalFormData.loopbackWindow,
        ).then(() => goalId);
      }
      return goalId;
    });
  },
};

export default GoalFormService;

function getLoopbackWindow(
  goalId: string,
): Promise<LoopbackWindow | undefined> {
  const noLoolbackWindow = undefined;
  return GoalService.getAttributionModels(goalId).then(res => {
    const loopbackWindowFound = res.data.find(
      ats => ats.artifact_id === LoopbackWindowArtifactId && ats.default,
    );
    if (!loopbackWindowFound) {
      return noLoolbackWindow;
    }
    return AttributionModelService.getAttributionModelProperties(
      loopbackWindowFound.attribution_model_id,
    ).then(propsRes => {
      const postViewProp = propsRes.data.find(
        prop => prop.technical_name === 'post_view',
      );
      const postClickProp = propsRes.data.find(
        prop => prop.technical_name === 'post_click',
      );
      if (!postViewProp && !postClickProp) return noLoolbackWindow;
      return {
        postView: (postViewProp as IntPropertyResource).value.value,
        postClick: (postClickProp as IntPropertyResource).value.value,
      };
    });
  });
}

function persistLoopbackWindow(
  organisationId: string,
  goalId: string,
  loopbackWindow: LoopbackWindow,
): Promise<AttributionSelectionResource> {
  return getOrCreateLoopbackWindowAttributionModel(
    organisationId,
    loopbackWindow,
  ).then(lpAttributionModel => {
    return GoalService.createAttributionModel(goalId, {
      attribution_model_id: lpAttributionModel.id,
      attribution_type: 'WITH_PROCESSOR',
      default: true,
    }).then(res => res.data);
  });
}

function getOrCreateLoopbackWindowAttributionModel(
  organisationId: string,
  loopbackWindow: LoopbackWindow,
): Promise<AttributionModelResource> {
  const predefinedAttributionModelName = `PV${loopbackWindow.postView}PC${
    loopbackWindow.postClick
  }`;
  return AttributionModelService.getAttributionModels(organisationId).then(
    resp => {
      const found = resp.data.find(
        model =>
          model.name === predefinedAttributionModelName &&
          model.artifact_id === LoopbackWindowArtifactId,
      );

      if (!found) {
        return AttributionModelService.createAttributionModel(organisationId, {
          artifact_id: LoopbackWindowArtifactId,
          group_id: 'com.mediarithmics.attribution',
          mode: 'DISCOVERY',
          name: predefinedAttributionModelName,
        }).then(res => {
          const newLoopbackWindowAttributionModel = res.data;
          return Promise.all([
            AttributionModelService.updateAttributionProperty(
              newLoopbackWindowAttributionModel.id,
              'post_view',
              loopbackWindow.postView,
            ),
            AttributionModelService.updateAttributionProperty(
              newLoopbackWindowAttributionModel.id,
              'post_click',
              loopbackWindow.postClick,
            ),
          ]).then(() => newLoopbackWindowAttributionModel);
        });
      }

      return found;
    },
  );
}
