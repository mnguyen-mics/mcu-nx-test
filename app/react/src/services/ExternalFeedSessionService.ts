import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PaginatedApiParam } from '@mediarithmics-private/advanced-components/lib/utils/ApiHelper';
import { injectable } from 'inversify';
import { ExternalFeedSession } from '../models/ExternalFeedSession';

export interface GetExternalFeedSessions extends PaginatedApiParam {
  open?: Boolean;
  published?: Boolean;
}

export interface IExternalFeedSessionService {
  getExternalFeedSessions: (
    audienceSegmentId: string,
    feedId: string,
    options: GetExternalFeedSessions,
  ) => Promise<DataListResponse<ExternalFeedSession>>;
}

@injectable()
export class ExternalFeedSessionService implements IExternalFeedSessionService {
  getExternalFeedSessions(
    audienceSegmentId: string,
    feedId: string,
    options: GetExternalFeedSessions = {},
  ): Promise<DataListResponse<ExternalFeedSession>> {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${feedId}/feed_sessions`;

    return ApiService.getRequest(endpoint, options);
  }
}
