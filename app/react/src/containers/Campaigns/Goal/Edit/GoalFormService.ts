import {
  Task,
  executeTasksInSequence,
  createFieldArrayModelWithMeta,
} from './../../../../utils/FormHelper';
import {
  isGoalResource,
  GoalFormData,
  AttributionModelListFieldModel,
  INITIAL_GOAL_FORM_DATA,
  isAttributionSelectionResource,
} from './domain';
import { GoalResource } from '../../../../models/goal';
import GoalService from '../../../../services/GoalService';
import queryService from '../../../../services/QueryService';

const GoalFormService = {
  loadGoalData(goalId: string): Promise<GoalFormData> {
    return Promise.all([
      GoalService.getGoal(goalId),
      GoalService.getAttributionModels(goalId),
    ]).then(([goalRes, attribModelRes]) => {
      
      const goalFormData: GoalFormData = {
        ...INITIAL_GOAL_FORM_DATA,
        goal: goalRes.data,
        triggerType: goalRes.data.new_query_id ? 'QUERY': 'PIXEL',
        attributionModels: attribModelRes.data.map(attributionModel =>
          createFieldArrayModelWithMeta(attributionModel, {
            name: attributionModel.attribution_model_name,
            group_id: attributionModel.group_id,
            artifact_id: attributionModel.artifact_id,
            default: attributionModel.default,
          }),
        ),
      };
    
      if (goalRes.data.new_query_id) {
        return queryService
          .getQuery(goalRes.data.datamart_id, goalRes.data.new_query_id)
          .then(r => r.data)
          .then(res => {            
            goalFormData.query = res;
            goalFormData.queryLanguage = res.query_language;

            if (res.query_language === 'SELECTORQL') {

              const QueryContainer = (window as any).angular
                .element(document.body)
                .injector()
                .get('core/datamart/queries/QueryContainer');

              return new QueryContainer(goalRes.data.datamart_id, res.id)
                .load()
                .then((queryContainer: any) => {
                  goalFormData.queryContainer = queryContainer;
                  return goalFormData;
                });
            }

            return goalFormData;
          });
      }
      
      return goalFormData;

    });
  },

  saveGoal(
    organisationId: string,
    goalFormData: GoalFormData,
    initialGoalFormData: GoalFormData = INITIAL_GOAL_FORM_DATA,
  ): Promise<GoalResource> {
    let createOrUpdateGoalPromise;

    // save query if needed
    let goalDataToUpload = Promise.resolve(goalFormData.goal);
    if (goalFormData.triggerType === 'QUERY' && goalFormData.query) {
      if (goalFormData.queryLanguage === 'SELECTORQL') {
        goalDataToUpload = goalFormData.queryContainer
          .saveOrUpdate()
          .then((queryContainerUpdate: any) => {
            const queryId = queryContainerUpdate.id as string;
            return {
              ...goalFormData.goal,
              new_query_id: queryId,
            };
          });
      } else {        
        const query = { 
          ...goalFormData.query,
          query_language: goalFormData.queryLanguage,
         };
        goalDataToUpload = queryService.createQuery(goalFormData.goal.datamart_id!, query).then(resp => {
          return {
            ...goalFormData.goal,
            new_query_id: resp.data.id,
          };
        });
      }
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
    if (!isAttributionSelectionResource(field.model)) {
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
