import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import {
  AudienceBuilderFormData,
  AudienceBuilderGroupNode,
  AudienceBuilderQueryDocument,
  AudienceBuilderParametricPredicateNode,
  AudienceBuilderParametricPredicateGroupNode,
  isAudienceBuilderParametricPredicateNode,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';

export interface IAudienceBuilderQueryService {
  buildQueryDocument: (formData: AudienceBuilderFormData) => AudienceBuilderQueryDocument;

  runQuery: (
    datamartId: string,
    queryDocument: AudienceBuilderQueryDocument,
    success: (result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => void;

  generateAudienceBuilderFormData: (
    initialFormData: AudienceBuilderGroupNode[],
  ) => NewAudienceBuilderFormData;
}

@injectable()
export class AudienceBuilderQueryService implements IAudienceBuilderQueryService {
  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  buildQueryDocument = (formData: AudienceBuilderFormData): AudienceBuilderQueryDocument => {
    const includeGroup: AudienceBuilderGroupNode[] = formData.include.map(group => {
      return {
        type: 'GROUP',
        boolean_operator: 'OR',
        negation: false,
        expressions: group.expressions,
      };
    });

    const excludeGroup: AudienceBuilderGroupNode[] = formData.exclude.map(group => {
      return {
        type: 'GROUP',
        boolean_operator: 'OR',
        negation: true,
        expressions: group.expressions,
      };
    });

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

    return this.formatQuery(queryDocument);
  };

  runQuery = (
    datamartId: string,
    queryDocument: AudienceBuilderQueryDocument,
    success: (result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => {
    // TODO Remove `as QueryDocument` hack
    // AudienceBuilderQueryDocument and QueryDocument could inherit from the same abstraction.
    this._queryService
      .runJSONOTQLQuery(datamartId, queryDocument as QueryDocument, { parameterized: true })
      .then(queryResult => {
        success(queryResult.data);
      })
      .catch(err => {
        failure(err);
      });
  };

  formatQuery = (query: AudienceBuilderQueryDocument) => {
    if (query.where) {
      return {
        ...query,
        where: {
          ...query.where,
          expressions: (query.where as AudienceBuilderGroupNode).expressions.map(
            (exp: AudienceBuilderGroupNode) => {
              return {
                ...exp,
                expressions: exp.expressions.map((e: AudienceBuilderParametricPredicateNode) => {
                  if (!e.parameters || Object.keys(e.parameters).length === 0) {
                    return {
                      ...e,
                      parameters: {},
                    };
                  } else return e;
                }),
              };
            },
          ),
        },
      };
    } else return query;
  };

  generateAudienceBuilderFormData = (
    initialFormData: AudienceBuilderGroupNode[],
  ): NewAudienceBuilderFormData => {
    const includeNodes: AudienceBuilderParametricPredicateGroupNode[] = [];
    const excludeNodes: AudienceBuilderParametricPredicateGroupNode[] = [];

    const parseAudienceBuilderGroupNode = (node: AudienceBuilderGroupNode) => {
      const parametricPredicateNode: AudienceBuilderParametricPredicateGroupNode = {
        expressions: [],
      };
      node.expressions.forEach(expression => {
        if (isAudienceBuilderParametricPredicateNode(expression))
          parametricPredicateNode.expressions.push(expression);
        else throw new Error(`Expression ${expression} don't match a parametric predicate node`);
      });
      if (node.negation) {
        excludeNodes.push(parametricPredicateNode);
      } else includeNodes.push(parametricPredicateNode);
    };

    initialFormData.forEach(node => parseAudienceBuilderGroupNode(node));

    return {
      include: includeNodes,
      exclude: excludeNodes,
    };
  };
}
