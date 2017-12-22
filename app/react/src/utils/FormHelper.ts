import cuid from 'cuid';

export interface FieldArrayModel<T = any> {
  key: string;
  model: T;
}

export interface FieldArrayModelWithMeta<T = any, Y = any> {
  key: string;
  model: T;
  meta: Y;
}

// take the model id key if present
// usefull for domain object coming from api
export function createFieldArrayModel(model: {
  [key: string]: any;
}): FieldArrayModel {
  return {
    model: model,
    key: model.id || cuid(),
  };
}

export function createFieldArrayModelWithMeta(
  model: { [key: string]: any },
  meta: any,
): FieldArrayModelWithMeta {
  return {
    ...createFieldArrayModel(model),
    meta,
  };
}

export type Task<T = any> = () => Promise<T>;

export function executeTasksInSequence(tasks: Task[]): Promise<any> {
  return tasks.reduce((previousTask, task) => {
    return previousTask.then(() => {
      return task();
    });
  }, Promise.resolve());
}

// export function buildEditableResource<T extends { id?: string }>(resource: T) {
//   return {
//     id: resource.id ? resource.id : generateFakeId(),
//     resource,
//   };
// }

// export function getModifiedResources<T>(
//   modifiedArray: Array<EditableResource<T>>,
//   initialArray: Array<EditableResource<T>>,
// ): {
//   createResources: T[];
//   updateResources: T[];
//   deleteResources: T[];
// } {
//   return {
//     createResources: modifiedArray
//       .filter(
//         modifiedElement =>
//           !initialArray.find(
//             initialElement => initialElement.id === modifiedElement.id,
//           ),
//       )
//       .map(el => el.resource),
//     updateResources: initialArray
//       .filter(
//         initialElement =>
//           !!modifiedArray.find(
//             modifiedElement => modifiedElement.id === initialElement.id,
//           ),
//       )
//       .map(el => el.resource),
//     deleteResources: initialArray
//       .filter(
//         initialElement =>
//           !modifiedArray.find(
//             modifiedElement => modifiedElement.id === initialElement.id,
//           ),
//       )
//       .map(el => el.resource),
//   };
// }
