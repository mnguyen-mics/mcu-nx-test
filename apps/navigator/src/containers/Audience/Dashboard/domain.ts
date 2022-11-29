import { UserPartitionSegment } from './../../../models/audiencesegment/AudienceSegmentResource';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { isUserQuerySegment, isAudienceSegmentShape } from '../Segments/Edit/domain';
import { QueryResource, QueryTranslationRequest } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { isStandardSegmentBuilderQueryDocument } from '../StandardSegmentBuilder/domain';

export const getFormattedExperimentationQuery = (
  datamartId: string,
  queryId: string,
  queryService: IQueryService,
  segments: UserPartitionSegment[],
  intersectOperator: boolean,
): Promise<QueryResource> => {
  const buildQueryFragment = () => (acc: string, val: UserPartitionSegment, index: number) => {
    const commaOrRightBrackets = index !== segments.length - 1 ? ',' : ']}';
    return acc.concat(`"${val.id}"${commaOrRightBrackets}`);
  };

  const innerQuery =
    segments.length === 0 ? '' : segments.reduce(buildQueryFragment(), 'segments { id IN [');

  const buildAdditionnalQuery = (query: string) => {
    const operator = intersectOperator ? '' : 'NOT ';
    return `${operator}(${query})`;
  };

  return queryService.getQuery(datamartId, queryId).then(querySegmentRes => {
    const queryResource = querySegmentRes.data;

    switch (queryResource.query_language) {
      case 'OTQL':
        return Promise.resolve(formatQuery(queryResource, buildAdditionnalQuery(innerQuery)));

      case 'JSON_OTQL':
        const queryTranslationRequest: QueryTranslationRequest = {
          input_query_language: queryResource.query_language,
          input_query_language_subtype: queryResource.query_language_subtype,
          input_query_text: queryResource.query_text,
          output_query_language: 'OTQL',
        };
        return queryService
          .translateQuery(datamartId, queryTranslationRequest)
          .then(otqlQ => otqlQ.data)
          .then(otqlQ => {
            return Promise.resolve(
              formatQuery(
                {
                  id: queryResource.id,
                  datamart_id: queryResource.datamart_id,
                  major_version: queryResource.major_version,
                  minor_version: queryResource.minor_version,
                  query_language: otqlQ.output_query_language,
                  query_language_subtype: otqlQ.output_query_language_subtype,
                  query_text: otqlQ.output_query_text,
                },
                buildAdditionnalQuery(innerQuery),
              ),
            );
          });
      default:
        return queryResource;
    }
  });
};

export const getFormattedQuery = (
  datamartId: string,
  queryService: IQueryService,
  dashboardQuery: QueryResource,
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
): Promise<QueryResource> => {
  if (isAudienceSegmentShape(source)) {
    if (isUserQuerySegment(source) && source.query_id) {
      return queryService
        .getQuery(datamartId, source.query_id)
        .then(q => q.data)
        .then(q => {
          switch (q.query_language) {
            case 'OTQL':
              return Promise.resolve(
                formatQuery(dashboardQuery, extractOtqlWhereClause(q.query_text)),
              );
            case 'JSON_OTQL':
              return queryService
                .translateQuery(datamartId, {
                  input_query_language: q.query_language,
                  input_query_language_subtype: q.query_language_subtype,
                  input_query_text: q.query_text,
                  output_query_language: 'OTQL',
                })
                .then(otqlQ => otqlQ.data)
                .then(otqlQ => {
                  return Promise.resolve(
                    formatQuery(dashboardQuery, extractOtqlWhereClause(otqlQ.output_query_text)),
                  );
                });
            default:
              return dashboardQuery;
          }
        });
    }
    return Promise.resolve({
      ...dashboardQuery,
      query_language: 'OTQL',
      query_text: `${dashboardQuery.query_text} JOIN UserSegment WHERE id = \"${source.id}\"`,
    });
  } else if (
    isStandardSegmentBuilderQueryDocument(source) &&
    source.language_version === 'JSON_OTQL'
  ) {
    const queryTranslationRequest: QueryTranslationRequest = {
      input_query_language: 'JSON_OTQL',
      input_query_language_subtype: 'PARAMETRIC',
      input_query_text: JSON.stringify(source),
      output_query_language: 'OTQL',
    };

    return queryService
      .translateQuery(datamartId, queryTranslationRequest)
      .then(otqlQ => otqlQ.data)
      .then(otqlQ => {
        return Promise.resolve(
          formatQuery(dashboardQuery, extractOtqlWhereClause(otqlQ.output_query_text)),
        );
      });
  } else {
    return Promise.resolve(dashboardQuery);
  }
};

export const formatQuery = (query: QueryResource, additionnalQuery: string): QueryResource => {
  return {
    ...query,
    query_language: 'OTQL',
    query_text:
      additionnalQuery !== ' '
        ? hasWhereClause(query.query_text)
          ? `${query.query_text} AND ${additionnalQuery}`
          : `${query.query_text} WHERE ${additionnalQuery}`
        : query.query_text,
  };
};

export const extractOtqlWhereClause = (text: string) => {
  const formattedText = text.toLowerCase();
  const wherePosition = formattedText.indexOf('where');
  const whereClause = hasWhereClause(text)
    ? text.substr(wherePosition + 5, formattedText.length)
    : ' ';
  return whereClause;
};

export const hasWhereClause = (text: string) => {
  return text.toLowerCase().indexOf('where') > -1;
};
