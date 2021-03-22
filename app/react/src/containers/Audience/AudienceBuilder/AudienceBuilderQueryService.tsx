import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import {
    NewAudienceBuilderFormData,
    AudienceBuilderFormData,
    AudienceBuilderGroupNode,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { IQueryService } from '../../../services/QueryService';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { QueryDocument as GraphDBQueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { QueryDocument as AudienceBuilderQueryDocument } from '../../../models/audienceBuilder/AudienceBuilderResource';
import {
    AudienceBuilderParametricPredicateGroupNode,
    AudienceBuilderParametricPredicateNode,
} from '../../../models/audienceBuilder/AudienceBuilderResource';

export interface IAudienceBuilderQueryService {

    runQuery: (
        datamartId: string,
        formData: NewAudienceBuilderFormData,
        success: (queryDocument: GraphDBQueryDocument, result: OTQLResult) => void,
        failure: (err: any) => void
    ) => void;

    buildObjectTreeExpression: (
        formData: NewAudienceBuilderFormData
    ) => AudienceBuilderFormData | undefined
}

@injectable()
export class AudienceBuilderQueryService implements IAudienceBuilderQueryService {
    @inject(TYPES.IQueryService)
    private _queryService: IQueryService;

    private buildQueryDocument = (
        formData: AudienceBuilderFormData | undefined
    ): AudienceBuilderQueryDocument => {

        let query: AudienceBuilderQueryDocument = {
            language_version: 'JSON_OTQL',
            operations: [{
                directives: [{
                    name: 'count',
                }]
            }],
            from: 'UserPoint',
        };

        if (formData) {
            return {
                ...query,
                where: formData.where,
            };
        }

        return query;
    };

    private completeExpression = (
        expression: AudienceBuilderParametricPredicateNode
    ): AudienceBuilderParametricPredicateNode => {
        const filledParameters: any = [];

        Object.keys(expression.parameters).forEach(key => {
            const value = expression.parameters[key];
            if (value) {
                filledParameters[`${key}`] = value;
            }
        });

        return {
            ...expression,
            parameters: filledParameters,
        };
    }

    private completeGroup = (
        group: AudienceBuilderParametricPredicateGroupNode
    ): AudienceBuilderParametricPredicateGroupNode => {
        return {
            ...group,
            expressions: group.expressions.map(expression => {
                return this.completeExpression(expression);
            })
        }
    }

    private completeGroups = (
        groups: AudienceBuilderParametricPredicateGroupNode[]
    ): AudienceBuilderParametricPredicateGroupNode[] => {
        return groups.map(group => {
            return this.completeGroup(group)
        })
    }

    buildObjectTreeExpression = (
        formData: NewAudienceBuilderFormData
    ): AudienceBuilderFormData | undefined => {
        const includeGroup: AudienceBuilderGroupNode[] = formData.include.length != 0 ? [{
            type: 'GROUP',
            boolean_operator: 'AND',
            negation: false,
            expressions: this.completeGroups(formData.include)
        }] : []

        const excludeGroup: AudienceBuilderGroupNode[] = formData.exclude.length != 0 ? [{
            type: 'GROUP',
            boolean_operator: 'AND',
            negation: true,
            expressions: this.completeGroups(formData.exclude)
        }] : []

        const expressions = includeGroup.concat(excludeGroup)

        if (expressions.length != 0) {
            return {
                where: {
                    type: 'GROUP',
                    boolean_operator: 'AND',
                    negation: false,
                    expressions: expressions
                }
            }
        }

        return undefined;
    }

    runQuery = (
        datamartId: string,
        formData: NewAudienceBuilderFormData,
        success: (queryDocument: GraphDBQueryDocument, result: OTQLResult) => void,
        failure: (err: any) => void
    ) => {
        const expression = this.buildObjectTreeExpression(formData);
        const queryDocument: AudienceBuilderQueryDocument = this.buildQueryDocument(expression);

        console.log("qweqweqwe", queryDocument);
        // TODO Remove `as any` hack
        // AudienceBuilderQueryDocument and GraphDBQueryDocument could inherit from the same abstraction.
        const genericQueryDocument = queryDocument as any;

        this._queryService
            .runJSONOTQLQuery(datamartId, genericQueryDocument)
            .then(queryResult => {
                success(genericQueryDocument, queryResult.data);
            })
            .catch(err => {
                failure(err)
            });
    };
}