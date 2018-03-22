import {
  Task,
  executeTasksInSequence,
  createFieldArrayModelWithMeta,
} from './../../../../utils/FormHelper';
import {
  isGoalResource,
  NewGoalFormData,
  AttributionModelListFieldModel,
  INITIAL_GOAL_FORM_DATA,
  isAttributionSelectionResource,
  isAttributionModelFormData,
  TriggerMode,
} from './domain';
import { GoalResource } from '../../../../models/goal';
import GoalService from '../../../../services/GoalService';
import AttributionModelFormService from '../../../Settings/CampaignSettings/AttributionModel/Edit/AttributionModelFormService';
import queryService from '../../../../services/QueryService';

const GoalFormService = {
  // loadGoal(goalId: string): Promise<GoalFormData> {
  //   return Promise.all([
  //     GoalService.getGoal(goalId).then(res => res.data),
  //     getLookbackWindow(goalId),
  //   ]).then(([goal, lookbackWindow]) => {
  //     return {
  //       goal,
  //       lookbackWindow,
  //     };
  //   });
  // },

  loadGoalData(goalId: string, datamartId: string): Promise<NewGoalFormData> {
    return GoalService.getGoal(goalId)
      .then(resp => resp.data)
      .then(formData => {
        return GoalService.getAttributionModels(goalId)
          .then(res => res.data)
          .then(attributionModelList => {
            const goalFormData: NewGoalFormData = {
              goal: {},
              attributionModels: [],
              triggerMode: 'QUERY',
            };
            goalFormData.goal = formData;
            goalFormData.attributionModels = attributionModelList.map(
              attributionModel =>
                createFieldArrayModelWithMeta(attributionModel, {
                  name: attributionModel.attribution_model_name,
                  group_id: attributionModel.group_id,
                  artifact_id: attributionModel.artifact_id,
                  default: attributionModel.default,
                }),
            );
            const QueryContainer = (window as any).angular
              .element(document.body)
              .injector()
              .get('core/datamart/queries/QueryContainer');
            if (formData.new_query_id) {
              return queryService
                .getQuery(datamartId, formData.new_query_id)
                .then(r => r.data)
                .then(res => {
                  const defQuery = new QueryContainer(datamartId, res.id);
                  defQuery.load();
                  const triggerMode: TriggerMode = 'QUERY';
                  goalFormData.queryContainer = defQuery;
                  goalFormData.triggerMode = triggerMode;
                  return goalFormData;
                });
            } else {
              const triggerMode: TriggerMode = 'PIXEL';
              return Promise.resolve({
                ...goalFormData,
                queryContainer: new QueryContainer(datamartId),
                triggerMode: triggerMode,
              });
            }
          })
          .then((resp: NewGoalFormData) => {
            return resp;
          });
      });
  },

  saveGoal(
    organisationId: string,
    goalFormData: NewGoalFormData,
    initialGoalFormData: NewGoalFormData = INITIAL_GOAL_FORM_DATA,
  ): Promise<GoalResource> {
    let createOrUpdateGoalPromise;

    // save query if needed
    let goalDataToUpload = Promise.resolve(goalFormData.goal);
    if (goalFormData.triggerMode === 'QUERY' && goalFormData.queryContainer) {
      goalDataToUpload = goalFormData.queryContainer
        .saveOrUpdate()
        .then((queryContainerUpdate: any) => {
          const queryId = queryContainerUpdate.id as string;
          return {
            ...goalFormData.goal,
            new_query_id: queryId,
          };
        });
    }

    return goalDataToUpload.then(goalData => {
      if (goalFormData.goal && isGoalResource(goalFormData.goal)) {
        createOrUpdateGoalPromise = GoalService.updateGoal(
          goalFormData.goal.id,
          goalData,
        );
      } else {
        createOrUpdateGoalPromise = GoalService.createGoal(
          organisationId,
          goalData,
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

// function getLookbackWindow(
//   goalId: string,
// ): Promise<LookbackWindow | undefined> {
//   const noLookbackWindow = undefined;
//   return GoalService.getAttributionModels(goalId).then(res => {
//     const lookbackWindowFound = res.data.find(
//       ats => ats.artifact_id === LookbackWindowArtifactId && !!ats.default,
//     );
//     if (!lookbackWindowFound) {
//       return noLookbackWindow;
//     }
//     return AttributionModelService.getAttributionModelProperties(
//       lookbackWindowFound.attribution_model_id,
//     ).then(propsRes => {
//       const postViewProp = propsRes.data.find(
//         prop => prop.technical_name === 'post_view',
//       );
//       const postClickProp = propsRes.data.find(
//         prop => prop.technical_name === 'post_click',
//       );
//       if (!postViewProp && !postClickProp) return noLookbackWindow;
//       return {
//         postView: (postViewProp as IntPropertyResource).value.value,
//         postClick: (postClickProp as IntPropertyResource).value.value,
//       };
//     });
//   });
// }

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
  const initialIds: string[] = [];
  initialAttributionModelFields.forEach(field => {
    if (isAttributionSelectionResource(field.model)) {
      initialIds.push(field.model.id);
    }
  });
  const currentIds: string[] = [];
  attributionModelFields.forEach(field => {
    if (isAttributionSelectionResource(field.model)) {
      currentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  attributionModelFields.forEach(field => {
    if (isAttributionModelFormData(field.model)) {
      const attributionFormData = field.model;
      tasks.push(() =>
        AttributionModelFormService.saveOrCreatePluginInstance(
          organisationId,
          attributionFormData,
        ).then(attribModelRes => {
          return GoalService.linkAttributionModelToGoal(goalId, {
            attribution_model_id: attribModelRes.data.id,
            attribution_type: 'WITH_PROCESSOR',
            default: field.meta.default,
          });
        }),
      );
    } else if (!isAttributionSelectionResource(field.model)) {
      const attribSelCreateRequest = field.model;
      if (attribSelCreateRequest.attribution_type === 'DIRECT') {
        tasks.push(() =>
          GoalService.linkAttributionModelToGoal(goalId, {
            attribution_type: 'DIRECT',
            default: field.meta.default,
          }),
        );
      } else {
        tasks.push(() =>
          GoalService.linkAttributionModelToGoal(goalId, {
            attribution_model_id: attribSelCreateRequest.attribution_model_id,
            attribution_type: 'WITH_PROCESSOR',
            default: field.meta.default,
          }),
        );
      }
    } else {
      const attributionSelectionRes = field.model;
      tasks.push(() =>
        GoalService.updateLinkAttributionModel(
          goalId,
          attributionSelectionRes.id,
          {
            ...attributionSelectionRes,
            default: field.meta.default,
          },
        ),
      );
    }
  });

  initialIds.filter(id => !currentIds.includes(id)).forEach(id => {
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
