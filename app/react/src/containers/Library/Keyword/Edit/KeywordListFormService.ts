import KeywordListService from '../../../../services/Library/KeywordListsService';
import { Task, executeTasksInSequence } from '../../../../utils/FormHelper';
import {
  KeywordListFormData,
  KeywordFieldModel,
  INITIAL_KEYWORD_LIST_FORM_DATA,
} from './domain';
import {
  KeywordResource,
  KeywordCreateRequest,
} from '../../../../models/keywordList/keywordList';

const KeywordListFormService = {
  saveKeywordList(
    organisationId: string,
    formData: KeywordListFormData,
    initialFormData: KeywordListFormData = INITIAL_KEYWORD_LIST_FORM_DATA,
    keywordListId?: string,
  ) {
    let createOrUpdateKeywordListPromise;
    const body = {
      name: formData.name,
    };
    if (keywordListId) {
      createOrUpdateKeywordListPromise = KeywordListService.updateKeywordList(
        keywordListId,
        body,
      );
    } else {
      createOrUpdateKeywordListPromise = KeywordListService.createKeywordList(
        organisationId,
        body,
      );
    }
    return createOrUpdateKeywordListPromise.then(resp => {
      const newKeywordListId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getKeywordListExpressionTasks(
          newKeywordListId,
          formData.keywords,
          initialFormData.keywords,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newKeywordListId);
    });
  },
};

export function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

function getKeywordListExpressionTasks(
  keywordListId: string,
  keywordFields: KeywordFieldModel[],
  initialKeywordFields: KeywordFieldModel[] = []
): Task[] {

  const initialKeywordIds: string[] = [];
  initialKeywordFields.forEach(field => {
    if (
      hasId<
      KeywordResource,
        Partial<KeywordCreateRequest>
      >(field.model)
    ) {
      initialKeywordIds.push(field.model.id);
    }
  });

  const currentKeywordIds: string[] = [];
  keywordFields.forEach(field => {
    if (
      hasId<
      KeywordResource,
        Partial<KeywordCreateRequest>
      >(field.model)
    ) {
      currentKeywordIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  keywordFields.forEach(field => {
    if (
      !hasId<
      KeywordResource,
        Partial<KeywordCreateRequest>
      >(field.model)
    ) {
      tasks.push(() =>
        KeywordListService.createKeywordListExpression(
          keywordListId,
          field.model,
        ),
      );
    }
  });

  // removed keyword tasks
  initialKeywordIds
    .filter(id => !currentKeywordIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        KeywordListService.deleteKeywordListExpression(keywordListId, id),
      );
    });

  return tasks;
}

export default KeywordListFormService;
