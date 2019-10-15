import { IDealsListService } from '../../../../services/Library/DealListsService';
import { Task, executeTasksInSequence } from '../../../../utils/FormHelper';
import {
  DealListFormData,
  DealFieldModel,
  INITIAL_DEAL_LIST_FORM_DATA,
} from './domain';
import { DealResource } from '../../../../models/dealList/dealList';
import { TYPES } from '../../../../constants/types';
import { inject, injectable } from 'inversify';

export interface IDealListFormService {
  saveDealList(
    organisationId: string,
    formData: DealListFormData,
    initialFormData: DealListFormData,
    dealListId?: string,
  ): Promise<string>; // careful
}

@injectable()
export class DealListFormService implements IDealListFormService {
  @inject(TYPES.IDealsListService)
  private _dealsListService: IDealsListService;

  saveDealList(
    organisationId: string,
    formData: DealListFormData,
    initialFormData: DealListFormData = INITIAL_DEAL_LIST_FORM_DATA,
    dealListId?: string,
  ) {
    let createOrUpdateDealListPromise;
    const body = {
      name: formData.name,
      organisation_id: organisationId,
    };
    if (dealListId) {
      createOrUpdateDealListPromise = this._dealsListService.updateDealList(
        organisationId,
        dealListId,
        body,
      );
    } else {
      createOrUpdateDealListPromise = this._dealsListService.createDealList(
        organisationId,
        body,
      );
    }
    return createOrUpdateDealListPromise.then(resp => {
      const newDealListId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...this.getDealListExpressionTasks(
          organisationId,
          newDealListId,
          formData.deals,
          initialFormData.deals,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newDealListId);
    });
  }

  hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
    return (resource as T).id !== undefined;
  }

  getDealListExpressionTasks(
    organisationId: string,
    dealListId: string,
    dealFields: DealFieldModel[],
    initialDealFields: DealFieldModel[] = [],
  ): Task[] {
    const initialDealIds: string[] = [];
    initialDealFields.forEach(field => {
      if (this.hasId<DealResource, Partial<DealResource>>(field.model)) {
        initialDealIds.push(field.model.id);
      }
    });

    const currentDealIds: string[] = [];
    dealFields.forEach(field => {
      if (this.hasId<DealResource, Partial<DealResource>>(field.model)) {
        currentDealIds.push(field.model.id);
      }
    });

    const tasks: Task[] = [];
    dealFields.forEach(field => {
      if (!this.hasId<DealResource, Partial<DealResource>>(field.model)) {
        tasks.push(() =>
          this._dealsListService
            .createDeal(organisationId, {
              ...field.model,
              organisation_id: organisationId,
            })
            .then(r =>
              this._dealsListService.addDealToDealList(dealListId, r.data.id),
            ),
        );
      }
    });

    // removed keyword tasks
    initialDealIds
      .filter(id => !currentDealIds.includes(id))
      .forEach(id => {
        tasks.push(() =>
          this._dealsListService
            .removeDealToDealList(dealListId, id)
            .then(r => this._dealsListService.deleteDeal(id)),
        );
      });

    return tasks;
  }
}
