import { createFieldArrayModelWithMeta } from './../../../../utils/FormHelper';
import {
  Task,
  executeTasksInSequence,
} from './../../../../utils/PromiseHelper';
import {
  isGoalResource,
  GoalFormData,
  AttributionModelListFieldModel,
  INITIAL_GOAL_FORM_DATA,
  isAttributionSelectionResource,
} from './domain';
import { GoalResource } from '../../../../models/goal';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import { IGoalService } from '../../../../services/GoalService';

export interface IGoalFormService {
  loadGoalData: (goalId: string) => Promise<GoalFormData>;
  saveGoal: (
    organisationId: string,
    goalFormData: GoalFormData,
    initialGoalFormData?: GoalFormData,
  ) => Promise<GoalResource>;
}

@injectable()
export class GoalFormService implements IGoalFormService {
  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @inject(TYPES.IGoalService)
  private _goalService: IGoalService;

  loadGoalData(goalId: string): Promise<GoalFormData> {
    return Promise.all([
      this._goalService.getGoal(goalId),
      this._goalService.getAttributionModels(goalId),
    ]).then(([goalRes, attribModelRes]) => {
      const goalFormData: GoalFormData = {
        ...INITIAL_GOAL_FORM_DATA,
        goal: goalRes.data,
        triggerType: goalRes.data.new_query_id ? 'QUERY' : 'PIXEL',
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
        return this._queryService
          .getQuery(goalRes.data.datamart_id, goalRes.data.new_query_id)
          .then(r => r.data)
          .then(res => {
            goalFormData.query = res;
            goalFormData.queryLanguage = res.query_language;
            return goalFormData;
          });
      }

      return goalFormData;
    });
  }

  saveGoal(
    organisationId: string,
    goalFormData: GoalFormData,
    initialGoalFormData: GoalFormData = INITIAL_GOAL_FORM_DATA,
  ): Promise<GoalResource> {
    let createOrUpdateGoalPromise;

    // save query if needed
    let goalDataToUpload = Promise.resolve(goalFormData.goal);
    if (goalFormData.triggerType === 'QUERY' && goalFormData.query) {
      const query = {
        ...goalFormData.query,
        datamart_id: goalFormData.goal.datamart_id,
        query_language: goalFormData.queryLanguage,
      };
      goalDataToUpload = this._queryService
        .createQuery(goalFormData.goal.datamart_id!, query)
        .then(resp => {
          return {
            ...goalFormData.goal,
            new_query_id: resp.data.id,
          };
        });
    }

    return goalDataToUpload.then(goalData => {
      if (goalFormData.goal && isGoalResource(goalFormData.goal)) {
        createOrUpdateGoalPromise = this._goalService.updateGoal(
          goalFormData.goal.id,
          goalData,
        );
      } else {
        createOrUpdateGoalPromise = this._goalService.createGoal(
          organisationId,
          goalData,
        );
      }

      return createOrUpdateGoalPromise.then(resp => {
        const goalResourceId = resp.data.id;
        const tasks: Task[] = [];
        tasks.push(
          ...this.getAttributionModelTasks(
            goalResourceId,
            goalFormData.attributionModels,
            initialGoalFormData.attributionModels,
          ),
        );

        return executeTasksInSequence(tasks).then(() => resp.data);
      });
    });
  }

  getAttributionModelTasks(
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
            this._goalService.linkAttributionModelToGoal(goalId, {
              attribution_type: 'DIRECT',
              default: field.meta.default,
            }),
          );
        } else {
          tasks.push(() =>
            this._goalService.linkAttributionModelToGoal(goalId, {
              attribution_model_id: attribSelCreateRequest.attribution_model_id,
              attribution_type: 'WITH_PROCESSOR',
              default: field.meta.default,
            }),
          );
        }
      } else {
        const attributionSelectionRes = field.model;
        tasks.push(() =>
          this._goalService.updateLinkAttributionModel(
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

    initialIds
      .filter(id => !currentIds.includes(id))
      .forEach(id => {
        tasks.push(() => this._goalService.deleteAttributionModel(goalId, id));
      });
    return tasks;
  }
}
