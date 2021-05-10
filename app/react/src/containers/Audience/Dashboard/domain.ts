import { UserPartitionSegment } from './../../../models/audiencesegment/AudienceSegmentResource';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { isUserQuerySegment, isAudienceSegmentShape } from '../Segments/Edit/domain';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';
import { AudienceBuilderQueryDocument } from '../../../models/audienceBuilder/AudienceBuilderResource';

export const getFormattedExperimentationQuery = (
  datamartId: string,
  queryId: string,
  queryService: IQueryService,
  segments: UserPartitionSegment[],
  intersectOperator: boolean,
): Promise<QueryResource> => {
  const buildQueryFragment = () => (acc: string, val: UserPartitionSegment, index: number) => {
    const or = index !== segments.length - 1 ? 'OR ' : '';
    return acc.concat(`segments { id = "${val.id}"} ${or}`);
  };

  const innerQuery = segments.reduce(buildQueryFragment(), '');

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
        return queryService
          .convertJsonOtql2Otql(datamartId, queryResource)
          .then(otqlQ => otqlQ.data)
          .then(otqlQ => {
            return Promise.resolve(formatQuery(otqlQ, buildAdditionnalQuery(innerQuery)));
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
  source?: AudienceSegmentShape | AudienceBuilderQueryDocument,
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
                .convertJsonOtql2Otql(datamartId, q)
                .then(otqlQ => otqlQ.data)
                .then(otqlQ => {
                  return Promise.resolve(
                    formatQuery(dashboardQuery, extractOtqlWhereClause(otqlQ.query_text)),
                  );
                });
            default:
              return dashboardQuery;
          }
        });
    }
    return Promise.resolve(formatQuery(dashboardQuery, `segments { id = \"${source.id}\"}`));
  } else if (isAudienceBuilderQueryDocument(source) && source.language_version === 'JSON_OTQL') {
    const queryResource = {
      datamart_id: datamartId,
      query_language: 'JSON_OTQL',
      query_text: JSON.stringify(source),
    };

    return queryService
      .convertJsonOtql2Otql(datamartId, queryResource as QueryResource, { parameterized: true })
      .then(otqlQ => otqlQ.data)
      .then(otqlQ => {
        return Promise.resolve(
          formatQuery(dashboardQuery, extractOtqlWhereClause(otqlQ.query_text)),
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

function isAudienceBuilderQueryDocument(
  source?: AudienceSegmentShape | AudienceBuilderQueryDocument,
): source is AudienceBuilderQueryDocument {
  return (
    source !== undefined && (source as AudienceBuilderQueryDocument).language_version !== undefined
  );
}
