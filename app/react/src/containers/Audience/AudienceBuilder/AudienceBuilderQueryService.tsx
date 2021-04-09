import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { QueryDocument as GraphDBQueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import {
  NewAudienceBuilderFormData,
  AudienceBuilderGroupNode,
  QueryDocument as AudienceBuilderQueryDocument,
} from '../../../models/audienceBuilder/AudienceBuilderResource';

export interface IAudienceBuilderQueryService {
  buildQueryDocument: (
    formData: NewAudienceBuilderFormData,
  ) => AudienceBuilderQueryDocument;
  runQuery: (
    datamartId: string,
    formData: NewAudienceBuilderFormData,
    success: (queryDocument: GraphDBQueryDocument, result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => void;
}

@injectable()
export class AudienceBuilderQueryService
  implements IAudienceBuilderQueryService {
  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  buildQueryDocument = (
    formData: NewAudienceBuilderFormData,
  ): AudienceBuilderQueryDocument => {
    const includeGroup: AudienceBuilderGroupNode[] = formData.include.map(
      (group) => {
        return {
          type: 'GROUP',
          boolean_operator: 'OR',
          negation: false,
          expressions: group.expressions,
        };
      },
    );

    const excludeGroup: AudienceBuilderGroupNode[] = formData.exclude.map(
      (group) => {
        return {
          type: 'GROUP',
          boolean_operator: 'OR',
          negation: true,
          expressions: group.expressions,
        };
      },
    );

    const expressions = includeGroup.concat(excludeGroup);

    const queryDocument: AudienceBuilderQueryDocument = {
      language_version: 'JSON_OTQL',
      operations: [
        {
          directives: [
            {
              name: 'count',
            },
          ],
        },
      ],
      from: 'UserPoint',
    };

    if (expressions.length !== 0) {
      queryDocument.where = {
        type: 'GROUP',
        boolean_operator: 'AND',
        expressions: expressions,
      };
    }

    return queryDocument;
  };

  runQuery = (
    datamartId: string,
    formData: NewAudienceBuilderFormData,
    success: (queryDocument: GraphDBQueryDocument, result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => {
    // TODO Remove `as any` hack
    // AudienceBuilderQueryDocument and GraphDBQueryDocument could inherit from the same abstraction.
    const queryDocument = this.buildQueryDocument(formData) as any;

    this._queryService
      .runJSONOTQLQuery(datamartId, queryDocument)
      .then((queryResult) => {
        success(queryDocument, queryResult.data);
      })
      .catch((err) => {
        failure(err);
      });
  };
}
