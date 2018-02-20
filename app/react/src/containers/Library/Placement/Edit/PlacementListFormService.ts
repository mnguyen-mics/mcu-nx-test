import {
  PlacementDescriptorResource,
  PlacementDescriptorCreateRequest,
} from './../../../../models/placement/PlacementDescriptorResource';
import {
  PlacementListFormData,
  INITIAL_PLACECMENT_LIST_FORM_DATA,
  PlacementDescriptorFormData,
  PlacementDescriptorListFieldModel,
} from './domain';
import PlacementListService from '../../../../services/Library/PlacementListsService';
import {
  Task,
  executeTasksInSequence,
} from '../../../../utils/FormHelper';

const PlacementListFormService = {
  savePlacementList(
    organisationId: string,
    formData: PlacementListFormData,
    initialFormData: PlacementListFormData = INITIAL_PLACECMENT_LIST_FORM_DATA,
    placementListId?: string,
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
        ),
      );
      return executeTasksInSequence(tasks).then(() => newPlacementListId);
    });
  },
  
  savePlacementDescriptor(
    placementDescriptorId: string,
    formData: PlacementDescriptorFormData,
  ) {
    let createOrUpdatePlacementDescriptorPromise;
    if (
      formData &&
      hasId<
        PlacementDescriptorResource,
        Partial<PlacementDescriptorCreateRequest>
      >(formData)
    ) {
			createOrUpdatePlacementDescriptorPromise =
			PlacementListService.updatePlacementDescriptor(
				placementDescriptorId,
				formData.id,
				formData
			);
    } else {
			createOrUpdatePlacementDescriptorPromise =
			PlacementListService.createPlacementDescriptor(
				placementDescriptorId,
				formData
			);
		}

		return createOrUpdatePlacementDescriptorPromise;
   
  },
};

function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

function getPlacementDescriptorTasks(
  placementListId: string,
  placementDescriptorFields: PlacementDescriptorListFieldModel[],
  initialPlacementDescriptorFields: PlacementDescriptorListFieldModel[] = [],
): Task[] {
  const initialPlacementDescriptorIds: string[] = [];
  initialPlacementDescriptorFields.forEach(field => {
    if (
      hasId<
        PlacementDescriptorResource,
        Partial<PlacementDescriptorCreateRequest>
      >(field.model)
    ) {
      initialPlacementDescriptorIds.push(field.model.id);
    }
  });

  const currentPlacementDescriptorIds: string[] = [];
  placementDescriptorFields.forEach(field => {
    if (
      hasId<
        PlacementDescriptorResource,
        Partial<PlacementDescriptorCreateRequest>
      >(field.model)
    ) {
      currentPlacementDescriptorIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  // create or update PlacementDescriptor tasks
  placementDescriptorFields.forEach(field => {
    tasks.push(() =>
      PlacementListFormService.savePlacementDescriptor(
        placementListId,
        field.model,
      ),
    );
  });

  // removed placement descriptor tasks
  initialPlacementDescriptorIds
    .filter(id => !currentPlacementDescriptorIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        PlacementListService.deletePlacementDescriptor(placementListId, id),
      );
    });

  return tasks;
}

export default PlacementListFormService;
