import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { isUserQuerySegment } from '../Segments/Edit/domain';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';



export const getFormattedQuery = (
  datamartId: string,
  queryService: IQueryService,
  dashboardQuery: QueryResource,
  segment?: AudienceSegmentShape,
): Promise<QueryResource> => {
  if (!segment) {
    return Promise.resolve(dashboardQuery);
  }
  if (isUserQuerySegment(segment) && segment.query_id) {
    return queryService.getQuery(datamartId, segment.query_id)
      .then(q => q.data)
      .then(q => {
        switch (q.query_language) {
          case "OTQL":
            return Promise.resolve(formatQuery(dashboardQuery, extractOtqlWhereClause(q.query_text)));
          case "JSON_OTQL":
            return queryService.convertJsonOtql2Otql(datamartId, q)
              .then(otqlQ => otqlQ.data)
              .then(otqlQ => {
                return Promise.resolve(formatQuery(dashboardQuery, extractOtqlWhereClause(otqlQ.query_text)))
              })
          default:
            return dashboardQuery
        }
      })
  }
  return Promise.resolve(formatQuery(dashboardQuery, `segments { id = \"${segment.id}\"}`) );
};

export const formatQuery = (
  query: QueryResource,
  additionnalQuery: string
): QueryResource => {
  return {
    ...query,
    query_language: "OTQL",
    query_text: `${query.query_text} AND ${additionnalQuery}`
  }
}

export const extractOtqlWhereClause = (text: string) => {
  const formattedText = text.toLowerCase();
  const wherePosition = formattedText.indexOf("where");
  const whereClause = text.substr(wherePosition + 5, formattedText.length);
  return whereClause;
}