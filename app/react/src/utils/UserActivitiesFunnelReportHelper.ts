import { 
  FunnelFilter, 
  FunnelTimeRange, 
  FunnelRequestBody 
} from '../models/datamart/UserActivitiesFunnel';

export function buildUserActivitiesFunnelRequestBody(
  funnelFilter: FunnelFilter[],
  funnelTimeRange: FunnelTimeRange
): FunnelRequestBody {

  const body: FunnelRequestBody = {
    for: funnelFilter,
    in: funnelTimeRange,
    number_of_parts_to_split_on: 10
  };

  return body;
}
