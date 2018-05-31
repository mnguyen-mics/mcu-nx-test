import DealListsService from '../../../../services/Library/DealListsService';
import { Task, executeTasksInSequence } from '../../../../utils/FormHelper';
import {
  DealListFormData,
  DealFieldModel,
  INITIAL_DEAL_LIST_FORM_DATA,
} from './domain';
import { DealResource } from '../../../../models/dealList/dealList';

const DealListFormService = {
  saveDealList(
    organisationId: string,
    formData: DealListFormData,
    initialFormData: DealListFormData = INITIAL_DEAL_LIST_FORM_DATA,
    dealListId?: string,
  ) {
    let createOrUpdateDealListPromise;
    const body = {
      name: formData.name,
      organisation_id: organisationId
    };
    if (dealListId) {
      createOrUpdateDealListPromise = DealListsService.updateDealList(
        dealListId,
        body,
      );
    } else {
      createOrUpdateDealListPromise = DealListsService.createDealList(
        organisationId,
        body,
      );
    }
    return createOrUpdateDealListPromise.then(resp => {
      const newDealListId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getDealListExpressionTasks(
          organisationId,
          newDealListId,
          formData.deals,
          initialFormData.deals,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newDealListId);
    });
  },
};

export function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

function getDealListExpressionTasks(
  organisationId: string,
  dealListId: string,
  dealFields: DealFieldModel[],
  initialDealFields: DealFieldModel[] = []
): Task[] {

  const initialDealIds: string[] = [];
  initialDealFields.forEach(field => {
    if (
      hasId<
      DealResource,
        Partial<DealResource>
      >(field.model)
    ) {
      initialDealIds.push(field.model.id);
    }
  });

  const currentDealIds: string[] = [];
  dealFields.forEach(field => {
    if (
      hasId<
      DealResource,
        Partial<DealResource>
      >(field.model)
    ) {
      currentDealIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  dealFields.forEach(field => {
    if (
      !hasId<
      DealResource,
        Partial<DealResource>
      >(field.model)
    ) {
      tasks.push(() =>
        DealListsService.createDeal(
          organisationId,
          {...field.model, organisation_id: organisationId},
        ).then(r => DealListsService.addDealToDealList(dealListId, r.data.id)),
      );
    }
  });

  // removed keyword tasks
  initialDealIds
    .filter(id => !currentDealIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        DealListsService.removeDealToDealList(dealListId, id).then(r => DealListsService.deleteDeal(id)),
      );
    });

  return tasks;
}

export default DealListFormService;
