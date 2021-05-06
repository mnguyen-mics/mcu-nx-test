import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import { buildFeedCardStatsRequestBody } from '../utils/FeedsStatsReportHelper';
import { ReportRequestBody } from '../models/ReportRequestBody';

export interface IFeedsStatsService {
  getSegmentStats: (organisationId: string, segmentId: string) => Promise<ReportViewResponse>;

  getStats: (organisationId: string, report: ReportRequestBody) => Promise<ReportViewResponse>;
}

@injectable()
export class FeedsStatsService implements IFeedsStatsService {
  getSegmentStats(organisationId: string, segmentId: string): Promise<ReportViewResponse> {
    const reportBody = buildFeedCardStatsRequestBody(segmentId);
    return this.getStats(organisationId, reportBody);
  }

  getStats(organisationId: string, report: ReportRequestBody): Promise<ReportViewResponse> {
    const endpoint = 'reports/feed_report';
    const params = {
      organisation_id: organisationId,
    };
    return ApiService.postRequest(endpoint, report, params);
  }
}
