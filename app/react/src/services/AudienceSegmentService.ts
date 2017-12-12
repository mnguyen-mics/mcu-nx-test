import ApiService, { DataListResponse, DataResponse } from './ApiService';
import ReportService from './ReportService';
import { AudienceSegmentResource, AudienceSegmentType, UserQueryEvaluationMode } from '../models/audiencesegment/AudienceSegmentResource';
import { normalizeArrayOfObject } from '../utils/Normalizer';
import { normalizeReportView } from '../utils/MetricHelper';
import McsMoment from '../utils/McsMoment';

interface GetSegmentsOption {
  name?: string;
  technical_name?: string;
  type?: AudienceSegmentType;
  evaluation_mode?: UserQueryEvaluationMode;
  first_result?: number;
  max_results?: number;
  with_source_datamarts?: boolean;
  campaign_id?: string;
  audience_partition_id?: string;
  persisted?: boolean;
}

const AudienceSegmentService = {

  getSegments(
    organisationId?: string,
    datamartId?: string,
    options: GetSegmentsOption = {},
  ): Promise<DataListResponse<AudienceSegmentResource>> {
    const endpoint = 'audience_segments';
    const params = {
      organisation_id: organisationId,
      datamart_id: datamartId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getSegment(
    segmentId: string,
  ): Promise<DataResponse<AudienceSegmentResource>> {
    const endpoint = `audience_segments/${segmentId}`;
    return ApiService.getRequest(endpoint);
  },

  // TODO return type (JobExec...)
  createOverlap(
    datamartId: string,
    segmentId: string,
  ): Promise<any> {
    const endpoint = `datamarts/${datamartId}/overlap_analysis`;
    const header = { 'Content-Type': 'application/json' };
    const body = {
      first_party_overlap: {
        source: {
          type: 'segment_overlap',
          segment_id: segmentId,
          datamart_id: datamartId,
        },
        type: 'FIRST_PARTY_OVERLAP',
      },
    };

    return ApiService.postRequest(endpoint, body, {}, header);
  },

  retrieveOverlap(
    segmentId: string,
    options: {
      first_result?: number,
      max_results?: number,
    } = {},
  ): Promise<any> {
    const endpoint = `audience_segments/${segmentId}/overlap_analysis`;
    const params = {
      audienceSegmentId: segmentId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },

  // DEPRECATED, will be removed in a near future
  getSegmentMetaData(
    organisationId: string,
  ): Promise<any> {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
    )
      .then(res => normalizeArrayOfObject(
        normalizeReportView(res.data.report_view),
        'audience_segment_id',
      ));
  },

  // DEPRECATED, will be removed in a near future
  getSegmentsWithMetadata(
    organisationId: string,
    datamartId: string,
    options: GetSegmentsOption = {},
  ): Promise<any> {
    return Promise.all([
      AudienceSegmentService.getSegments(organisationId, datamartId, options),
      AudienceSegmentService.getSegmentMetaData(organisationId),
    ])
      .then(([segmentApiResp, metadata]) => {
        const augmentedSegments = segmentApiResp.data.map((segment: any) => {
          const meta = metadata[segment.id];
          const userPoints = (meta && meta.user_points ? meta.user_points : '-');
          const desktopCookieIds = (meta && meta.desktop_cookie_ids ? meta.desktop_cookie_ids : '-');

          return { ...segment, user_points: userPoints, desktop_cookie_ids: desktopCookieIds };
        });

        return {
          ...segmentApiResp,
          data: augmentedSegments,
        };
      });
  },

};

export default AudienceSegmentService;
