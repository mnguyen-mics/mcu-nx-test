import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { isUserQuerySegment, isUserListSegment } from '../Segments/Edit/domain';
import { DataResponse } from '../../../services/ApiService';
import { IQueryService } from '../../../services/QueryService';



export const getWhereClausePromise = (
  datamartId: string,
  queryService: IQueryService,
  segment?: AudienceSegmentShape,
) => {
  let whereClausePromise: Promise<DataResponse<string> | string>;
  if (!segment) {
    return Promise.resolve('')
  }
  if (isUserQuerySegment(segment) && segment.query_id) {
    whereClausePromise = queryService.getWhereClause(
      datamartId,
      segment.query_id,
    );
  } else if (isUserListSegment(segment)) {
    whereClausePromise = Promise.resolve(`segments { id = \"${segment.id}\"}`);
  } else {
    whereClausePromise = Promise.resolve('');
  }
  return whereClausePromise;
};
