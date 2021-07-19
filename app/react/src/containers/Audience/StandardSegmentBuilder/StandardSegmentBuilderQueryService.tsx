import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import {
  StandardSegmentBuilderFormData,
  StandardSegmentBuilderGroupNode,
  StandardSegmentBuilderQueryDocument,
  StandardSegmentBuilderParametricPredicateNode,
  StandardSegmentBuilderParametricPredicateGroupNode,
  isStandardSegmentBuilderParametricPredicateNode,
} from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { QueryResource } from '../../../models/datamart/DatamartResource';

export interface IStandardSegmentBuilderQueryService {
  buildQueryDocument: (formData: StandardSegmentBuilderFormData) => StandardSegmentBuilderQueryDocument;

  runQuery: (
    datamartId: string,
    queryDocument: StandardSegmentBuilderQueryDocument,
    success: (result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => void;

  generateStandardSegmentBuilderFormData: (
    initialFormData: StandardSegmentBuilderGroupNode[],
  ) => StandardSegmentBuilderFormData;
}

@injectable()
export class StandardSegmentBuilderQueryService implements IStandardSegmentBuilderQueryService {
  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;

  buildQueryDocument = (formData: StandardSegmentBuilderFormData): StandardSegmentBuilderQueryDocument => {
    const includeGroup: StandardSegmentBuilderGroupNode[] = formData.include.map(group => {
      return {
        type: 'GROUP',
        boolean_operator: 'OR',
        negation: false,
        expressions: group.expressions,
      };
    });

    const excludeGroup: StandardSegmentBuilderGroupNode[] = formData.exclude.map(group => {
      return {
        type: 'GROUP',
        boolean_operator: 'OR',
        negation: true,
        expressions: group.expressions,
      };
    });

    const expressions = includeGroup.concat(excludeGroup);

    const queryDocument: StandardSegmentBuilderQueryDocument = {
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
    queryDocument: StandardSegmentBuilderQueryDocument,
    success: (result: OTQLResult) => void,
    failure: (err: any) => void,
  ) => {
    // TODO Make conversion without need of existing query resource. convertJsonOtql2Otql doens't check id anyway.
    const queryResource: QueryResource = {
      id: '123',
      datamart_id: datamartId,
      query_language: 'JSON_OTQL',
      query_language_subtype: 'PARAMETRIC',
      // TODO AudienceBuilderQueryDocument and QueryDocument could inherit from the same abstraction.
      query_text: JSON.stringify(queryDocument),
    };

    this._queryService
      .convertJsonOtql2Otql(datamartId, queryResource)
      .then(otqlQ => otqlQ.data.query_text)
      .then(queryText => {
        this._queryService
          .runOTQLQuery(datamartId, queryText)
          .then(queryResult => {
            success(queryResult.data);
          })
          .catch(err => {
            failure(err);
          });
      });
  };

  formatQuery = (query: StandardSegmentBuilderQueryDocument) => {
    if (query.where) {
      return {
        ...query,
        where: {
          ...query.where,
          expressions: (query.where as StandardSegmentBuilderGroupNode).expressions.map(
            (exp: StandardSegmentBuilderGroupNode) => {
              return {
                ...exp,
                expressions: exp.expressions.map((e: StandardSegmentBuilderParametricPredicateNode) => {
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

  generateStandardSegmentBuilderFormData = (
    initialFormData: StandardSegmentBuilderGroupNode[],
  ): StandardSegmentBuilderFormData => {
    const includeNodes: StandardSegmentBuilderParametricPredicateGroupNode[] = [];
    const excludeNodes: StandardSegmentBuilderParametricPredicateGroupNode[] = [];

    const parseStandardSegmentBuilderGroupNode = (node: StandardSegmentBuilderGroupNode) => {
      const parametricPredicateNode: StandardSegmentBuilderParametricPredicateGroupNode = {
        expressions: [],
      };
      node.expressions.forEach(expression => {
        if (isStandardSegmentBuilderParametricPredicateNode(expression))
          parametricPredicateNode.expressions.push(expression);
        else throw new Error(`Expression ${expression} don't match a parametric predicate node`);
      });
      if (node.negation) {
        excludeNodes.push(parametricPredicateNode);
      } else includeNodes.push(parametricPredicateNode);
    };

    initialFormData.forEach(node => parseStandardSegmentBuilderGroupNode(node));

    return {
      include: includeNodes,
      exclude: excludeNodes,
    };
  };
}
