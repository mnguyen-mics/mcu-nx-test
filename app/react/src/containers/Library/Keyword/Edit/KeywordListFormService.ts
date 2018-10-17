import { injectable } from 'inversify';
import { IKeywordListService } from '../../../../services/Library/KeywordListsService';
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
import {
  SERVICE_IDENTIFIER,
  lazyInject,
} from '../../../../services/inversify.config';

export interface IKeywordListFormService {
  saveKeywordList: (
    organisationId: string,
    formData: KeywordListFormData,
    initialFormData: KeywordListFormData,
    keywordListId?: string,
  ) => Promise<any>;
}

@injectable()
export class KeywordListFormService implements IKeywordListFormService {
  @lazyInject(SERVICE_IDENTIFIER.IKeywordListService)
  private _keywordListService: IKeywordListService;

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
      createOrUpdateKeywordListPromise = this._keywordListService.updateKeywordList(
        keywordListId,
        body,
      );
    } else {
      createOrUpdateKeywordListPromise = this._keywordListService.createKeywordList(
        organisationId,
        body,
      );
    }
    return createOrUpdateKeywordListPromise.then(resp => {
      const newKeywordListId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...this.getKeywordListExpressionTasks(
          newKeywordListId,
          formData.keywords,
          initialFormData.keywords,
        ),
      );
      return executeTasksInSequence(tasks).then(() => newKeywordListId);
    });
  }
  getKeywordListExpressionTasks(
    keywordListId: string,
    keywordFields: KeywordFieldModel[],
    initialKeywordFields: KeywordFieldModel[] = [],
  ): Task[] {
    const initialKeywordIds: string[] = [];
    initialKeywordFields.forEach(field => {
      if (hasId<KeywordResource, Partial<KeywordCreateRequest>>(field.model)) {
        initialKeywordIds.push((field.model as any).id);
      }
    });

    const currentKeywordIds: string[] = [];
    keywordFields.forEach(field => {
      if (hasId<KeywordResource, Partial<KeywordCreateRequest>>(field.model)) {
        currentKeywordIds.push((field.model as any).id);
      }
    });

    const tasks: Task[] = [];
    keywordFields.forEach(field => {
      if (!hasId<KeywordResource, Partial<KeywordCreateRequest>>(field.model)) {
        tasks.push(() =>
          this._keywordListService.createKeywordListExpression(
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
          this._keywordListService.deleteKeywordListExpression(
            keywordListId,
            id,
          ),
        );
      });

    return tasks;
  }
}

function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

export const keywordListFormService = new KeywordListFormService();
