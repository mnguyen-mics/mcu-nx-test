import McsMoment from '../utils/McsMoment';
import {
  FunnelFilter,
  FunnelTimeRange,
  FunnelRequestBody,
} from '../models/datamart/UserActivitiesFunnel';

export function buildUserActivitiesFunnelRequestBody(
  funnelFilter: FunnelFilter[],
  funnelTimeRange: FunnelTimeRange,
  limit?: number,
): FunnelRequestBody {
  const startDate: string = new McsMoment(funnelTimeRange.start_date)
    .toMoment()
    .format('YYYY-MM-DD');
  const endDate: string = new McsMoment(funnelTimeRange.end_date).toMoment().format('YYYY-MM-DD');
  const body: FunnelRequestBody = {
    for: funnelFilter,
    in: {
      ...funnelTimeRange,
      start_date: startDate,
      end_date: endDate,
    },
    number_of_parts_to_split_on: 10,
    limit,
  };

  return body;
}
