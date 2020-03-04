import { isEqual } from 'lodash';
import {
  PlacementDescriptorResource,
  PlacementDescriptorCreateRequest,
} from './../../../../models/placement/PlacementDescriptorResource';
import {
  PlacementListFormData,
  INITIAL_PLACEMENT_LIST_FORM_DATA,
  PlacementDescriptorListFieldModel,
} from './domain';
import { Task, executeTasksInSequence } from '../../../../utils/PromiseHelper';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../constants/types';
import { IPlacementListService } from '../../../../services/Library/PlacementListService';

function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

export interface IPlacementListFormService {
  savePlacementList: (
    organisationId: string,
    formData: PlacementListFormData,
    initialFormData: PlacementListFormData,
    placementListId?: string,
  ) => Promise<any>;

  getPlacementDescriptorTasks: (
    placementListId: string,
    placementDescriptorFields: PlacementDescriptorListFieldModel[],
    initialPlacementDescriptorFields: PlacementDescriptorListFieldModel[],
    file?: File,
  ) => Task[];
}

@injectable()
export class PlacementListFormService implements IPlacementListFormService {
  @inject(TYPES.IPlacementListService)
  private _placementListService: IPlacementListService;

  savePlacementList(
    organisationId: string,
    formData: PlacementListFormData,
    initialFormData: PlacementListFormData = INITIAL_PLACEMENT_LIST_FORM_DATA,
    placementListId?: string,
  ) {
    let createOrUpdatePlacementListPromise;
    const body = {
      name: formData.name,
    };
    if (placementListId) {
      createOrUpdatePlacementListPromise = this._placementListService.updatePlacementList(
        placementListId,
        body,
      );
    } else {
      createOrUpdatePlacementListPromise = this._placementListService.createPlacementList(
        organisationId,
        body,
      );
    }
    return createOrUpdatePlacementListPromise.then(resp => {
      const newPlacementListId = resp.data.id;
      const tasks: Task[] = [];

      tasks.push(
        ...this.getPlacementDescriptorTasks(
          newPlacementListId,
          formData.placementDescriptorList,
          initialFormData.placementDescriptorList,
          formData.file,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newPlacementListId);
    });
  }

  getPlacementDescriptorTasks(
    placementListId: string,
    placementDescriptorFields: PlacementDescriptorListFieldModel[],
    initialPlacementDescriptorFields: PlacementDescriptorListFieldModel[] = [],
    file?: File,
  ): Task[] {
    const initialPlacementDescriptor: Map<
      string,
      PlacementDescriptorResource
    > = new Map();
    const currentPlacementDescriptor: Map<
      string,
      PlacementDescriptorResource
    > = new Map();
    const tasks: Task[] = [];

    // Redux seems to returns dispatch() instead on undefined
    if (file && file.size > 0) {
      const formData = new FormData();
      formData.append('file', file as any, file.name);

      tasks.push(() =>
        this._placementListService.updatePlacementDescriptorBatch(
          placementListId,
          formData,
        ),
      );
    } else {
      initialPlacementDescriptorFields.forEach(field => {
        if (
          hasId<
            PlacementDescriptorResource,
            Partial<PlacementDescriptorCreateRequest>
          >(field.model)
        ) {
          initialPlacementDescriptor.set(field.model.id, field.model);
        }
      });

      placementDescriptorFields.forEach(field => {
        if (
          hasId<
            PlacementDescriptorResource,
            Partial<PlacementDescriptorCreateRequest>
          >(field.model)
        ) {
          // Updating already existing PlacementDescriptor
          currentPlacementDescriptor.set(field.model.id, field.model);
          const exisitingDescriptorField = initialPlacementDescriptor.get(
            field.key,
          );
          const currentDescriptor = field.model;
          if (
            exisitingDescriptorField &&
            !isEqual(currentDescriptor, exisitingDescriptorField)
          ) {
            tasks.push(() =>
              this._placementListService.updatePlacementDescriptor(
                placementListId,
                currentDescriptor.id,
                currentDescriptor,
              ),
            );
          }
        } else {
          // new descriptor
          tasks.push(() =>
            this._placementListService.createPlacementDescriptor(
              placementListId,
              field.model,
            ),
          );
        }
      });

      for (const [key] of initialPlacementDescriptor.entries()) {
        if (currentPlacementDescriptor.get(key) === undefined) {
          tasks.push(() =>
            this._placementListService.deletePlacementDescriptor(
              placementListId,
              key,
            ),
          );
        }
      }
    }

    return tasks;
  }
}
