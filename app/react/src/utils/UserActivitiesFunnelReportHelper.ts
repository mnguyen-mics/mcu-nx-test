import { 
  FunnelFilter, 
  FunnelTimeRange, 
  FunnelRequestBody 
} from '../models/datamart/UserActivitiesFunnel';

export function buildUserActivitiesFunnelRequestBody(
  funnelFilter: FunnelFilter,
  funnelTimeRange: FunnelTimeRange,
): FunnelRequestBody {

  const report: FunnelRequestBody = {
    for: [funnelFilter],
    in: funnelTimeRange
  };
  return report;
}
