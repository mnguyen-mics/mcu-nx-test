import { ApiService } from '@mediarithmics-private/advanced-components';
import { injectable } from 'inversify';
import {
  FunnelFilter,
  FunnelTimeRange,
  FunnelRequestBody,
  FunnelResponse,
} from '../models/datamart/UserActivitiesFunnel';
import { buildUserActivitiesFunnelRequestBody } from '../utils/UserActivitiesFunnelReportHelper';

export interface IUserActivitiesFunnelService {
  getUserActivitiesFunnel: (
    datamartId: string,
    funnelFilter: FunnelFilter[],
    funnelTimeRange: FunnelTimeRange,
    limit?: number,
  ) => Promise<FunnelResponse>;
}

@injectable()
export class UserActivitiesFunnelService implements IUserActivitiesFunnelService {
  getUserActivitiesFunnel(
    datamartId: string,
    funnelFilter: FunnelFilter[],
    funnelTimeRange: FunnelTimeRange,
    limit?: number,
  ): Promise<FunnelResponse> {
    const report: FunnelRequestBody = buildUserActivitiesFunnelRequestBody(
      funnelFilter,
      funnelTimeRange,
      limit,
    );
    const endpoint = `datamarts/${datamartId}/user_activities_funnel`;
    return ApiService.postRequest(endpoint, report);
  }
}
