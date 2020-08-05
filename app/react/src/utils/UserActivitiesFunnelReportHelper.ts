import { 
  FunnelFilter, 
  FunnelTimeRange, 
  FunnelRequestBody 
} from '../models/datamart/UserActivitiesFunnel';

export function buildUserActivitiesFunnelRequestBody(
  funnelFilter: FunnelFilter,
  funnelTimeRange: FunnelTimeRange,
): FunnelRequestBody {

  const body: FunnelRequestBody = {
    for: [funnelFilter],
    in: funnelTimeRange
  };
  return body;
}
