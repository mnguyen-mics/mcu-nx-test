import { isEqual } from 'lodash';
import {
  PlacementDescriptorResource,
  PlacementDescriptorCreateRequest,
} from './../../../../models/placement/PlacementDescriptorResource';
import {
  PlacementListFormData,
  INITIAL_PLACECMENT_LIST_FORM_DATA,
  PlacementDescriptorListFieldModel,
} from './domain';
import PlacementListService from '../../../../services/Library/PlacementListsService';
import { Task, executeTasksInSequence } from '../../../../utils/FormHelper';

const PlacementListFormService = {
  savePlacementList(
    organisationId: string,
    formData: PlacementListFormData,
    initialFormData: PlacementListFormData = INITIAL_PLACECMENT_LIST_FORM_DATA,
    placementListId?: string,
    file?: File,
  ) {
    let createOrUpdatePlacementListPromise;
    const body = {
      name: formData.name,
    };
    if (placementListId) {
      createOrUpdatePlacementListPromise = PlacementListService.updatePlacementList(
        placementListId,
        body,
      );
    } else {
      createOrUpdatePlacementListPromise = PlacementListService.createPlacementList(
        organisationId,
        body,
      );
    }
    return createOrUpdatePlacementListPromise.then(resp => {
      const newPlacementListId = resp.data.id;
      const tasks: Task[] = [];

      tasks.push(
        ...getPlacementDescriptorTasks(
          newPlacementListId,
          formData.placementDescriptorList,
          initialFormData.placementDescriptorList,
          file,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newPlacementListId);
    });
  },
};

function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

function getPlacementDescriptorTasks(
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
      PlacementListService.updatePlacementDescriptorBatch(
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
            PlacementListService.updatePlacementDescriptor(
              placementListId,
              currentDescriptor.id,
              currentDescriptor,
            ),
          );
        }
      } else {
        // new descriptor
        tasks.push(() =>
          PlacementListService.createPlacementDescriptor(
            placementListId,
            field.model,
          ),
        );
      }
    });

    for (const [key] of initialPlacementDescriptor.entries()) {
      if (currentPlacementDescriptor.get(key) === undefined) {
        tasks.push(() =>
          PlacementListService.deletePlacementDescriptor(placementListId, key),
        );
      }
    }
  }

  return tasks;
}

export default PlacementListFormService;
