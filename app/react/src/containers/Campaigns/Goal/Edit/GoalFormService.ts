import { isEqual } from 'lodash';
import { Task, executeTasksInSequence } from './../../../../utils/FormHelper';
import {
  GoalFormData,
  isGoalResource,
  LookbackWindow,
  NewGoalFormData,
  AttributionModelListFieldModel,
  INITIAL_GOAL_FORM_DATA,
} from './domain';
import { GoalResource } from '../../../../models/goal';
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
    goalFormData: NewGoalFormData,
    initialGoalFormData: NewGoalFormData = INITIAL_GOAL_FORM_DATA,
    queryContainer?: any,
  ): Promise<GoalResource> {
    let createOrUpdateGoalPromise;
    return queryContainer.saveOrUpdate().then(() => {
      const goalDataToUpload = {
        ...goalFormData.goal,
        new_query_id: queryContainer.id,
      };
      if (goalFormData.goal && isGoalResource(goalFormData.goal)) {
        createOrUpdateGoalPromise = GoalService.updateGoal(
          goalFormData.goal.id,
          goalDataToUpload,
        );
      } else {
        createOrUpdateGoalPromise = GoalService.createGoal(
          organisationId,
          goalDataToUpload,
        );
      }

      return createOrUpdateGoalPromise.then(resp => {
        const goalResourceId = resp.data.id;
        // if (goalFormData.lookbackWindow) {
        //   return persistLookbackWindow(
        //     organisationId,
        //     goalResource.id,
        //     goalFormData.lookbackWindow,
        //   ).then(() => goalResource);
        const tasks: Task[] = [];
        tasks.push(
          ...getAttributionModelTasks(
            organisationId,
            goalResourceId,
            goalFormData.attributionModels,
            initialGoalFormData.attributionModels,
          ),
        );

        return executeTasksInSequence(tasks).then(() => resp.data);
      });
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

// function persistLookbackWindow(
//   organisationId: string,
//   goalId: string,
//   lookbackWindow: LookbackWindow,
// ): Promise<AttributionSelectionResource> {
//   return getOrCreateLookbackWindowAttributionModel(
//     organisationId,
//     lookbackWindow,
//   ).then(lpAttributionModel => {
//     return GoalService.createAttributionModel(goalId, {
//       attribution_model_id: lpAttributionModel.id,
//       attribution_type: 'WITH_PROCESSOR',
//       default: true,
//     }).then(res => res.data);
//   });
// }

// function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
//   return (resource as T).id !== undefined;
// }

function getAttributionModelTasks(
  organisationId: string,
  goalId: string,
  attributionModelFields: AttributionModelListFieldModel[],
  initialAttributionModelFields: AttributionModelListFieldModel[] = [],
): Task[] {
  const initialAttributionModelIds: string[] = [];
  initialAttributionModelFields.forEach(field => {
    if ((field.model as any).attribution_model_id) {
      initialAttributionModelIds.push(
        (field.model as any).attribution_model_id,
      );
    }
  });

  const currentAttributionModelIds: string[] = [];
  attributionModelFields.forEach(field => {
    if ((field.model as any).attribution_model_id || (field.model as any).id) {
      currentAttributionModelIds.push(
        (field.model as any).attribution_model_id || (field.model as any).id,
      );
    }
  });

  const tasks: Task[] = [];
  attributionModelFields.forEach(field => {
    // Existing AM (linked to goal OR not linked)
    if ((field.model as any).attribution_model_id || (field.model as any).id) {
      const exisitingAttributionModelField = initialAttributionModelFields.find(
        v => v.key === field.key,
      );
      const currentAttrributionModel = field.model;
      // If linked AMs have been modified
      if (
        exisitingAttributionModelField &&
        !isEqual(currentAttrributionModel, exisitingAttributionModelField.model)
      ) {
        tasks.push(() => {
          return AttributionModelService.updateAttributionModel(
            (currentAttrributionModel as any).attribution_model_id,
            currentAttrributionModel,
          );
        });
        // AM not linked
      } else if ((field.model as any).id) {
        // we update in case user has updated it
        tasks.push(() => {
          return AttributionModelService.updateAttributionModel(
            (currentAttrributionModel as any).id,
            currentAttrributionModel,
          ).then(() => {
            GoalService.linkAttributionModelToGoal(
              goalId,
              currentAttrributionModel as any,
            );
          });
        });
      }
    } else {
      // new AM
      tasks.push(() =>
        AttributionModelService.createAttributionModel(
          organisationId,
          field.model as any,
        ).then(resp => {
          GoalService.linkAttributionModelToGoal(goalId, resp.data);
        }),
      );
    }
  });

  // removed attribution model tasks
  initialAttributionModelIds
    .filter(id => !currentAttributionModelIds.includes(id))
    .forEach(id => {
      tasks.push(() => GoalService.deleteAttributionModel(goalId, id));
    });

  return tasks;
}
// function getOrCreateLookbackWindowAttributionModel(
//   organisationId: string,
//   lookbackWindow: LookbackWindow,
// ): Promise<AttributionModelResource> {
//   const predefinedAttributionModelName = `PV${lookbackWindow.postView}PC${
//     lookbackWindow.postClick
//   }`;
//   return AttributionModelService.getAttributionModels(organisationId).then(
//     resp => {
//       const found = resp.data.find(
//         model =>
//           model.name === predefinedAttributionModelName &&
//           model.artifact_id === LookbackWindowArtifactId,
//       );

//       if (!found) {
//         return AttributionModelService.createAttributionModel(organisationId, {
//           artifact_id: LookbackWindowArtifactId,
//           group_id: 'com.mediarithmics.attribution',
//           mode: 'DISCOVERY',
//           name: predefinedAttributionModelName,
//         }).then(res => {
//           const newLookbackWindowAttributionModel = res.data;
//           return Promise.all([
//             AttributionModelService.updateAttributionProperty(
//               newLookbackWindowAttributionModel.id,
//               'post_view',
//               lookbackWindow.postView,
//             ),
//             AttributionModelService.updateAttributionProperty(
//               newLookbackWindowAttributionModel.id,
//               'post_click',
//               lookbackWindow.postClick,
//             ),
//           ]).then(() => newLookbackWindowAttributionModel);
//         });
//       }

//       return found;
//     },
//   );
// }
