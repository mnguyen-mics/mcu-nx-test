import ApiService, { DataListResponse, DataResponse } from './ApiService';
import ReportService from './ReportService';
import {
  AudienceSegmentResource,
  AudienceSegmentType,
  UserQueryEvaluationMode,
  AudienceSegment,
  UserListSegment
} from '../models/audiencesegment/AudienceSegmentResource';
import { normalizeArrayOfObject } from '../utils/Normalizer';
import { normalizeReportView } from '../utils/MetricHelper';
import McsMoment from '../utils/McsMoment';
import { PaginatedApiParam } from '../utils/ApiHelper';

export interface GetSegmentsOption extends PaginatedApiParam {
  name?: string;
  technical_name?: string;
  type?: AudienceSegmentType;
  evaluation_mode?: UserQueryEvaluationMode;
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
  ): Promise<DataResponse<AudienceSegment>> {
    const endpoint = `audience_segments/${segmentId}`;
    return ApiService.getRequest(endpoint);
  },

  updateAudienceSegment(
    segmentId: string,
    body: object,
  ): Promise<DataResponse<AudienceSegment>> {
    const endpoint = `audience_segments/${segmentId}`
    return ApiService.putRequest(endpoint, body);
  },

  deleteAudienceSegment(
    segmentId: string,
  ): Promise<any> {
    const endpoint = `audience_segments/${segmentId}`
    return ApiService.deleteRequest(endpoint);
  },

  saveSegment(
    organisationId: string,
    audienceSegment: Partial<UserListSegment>
  ): Promise<DataResponse<AudienceSegment>> {

    let createOrUpdatePromise;
    if (audienceSegment.id) {
      createOrUpdatePromise = AudienceSegmentService.updateAudienceSegment(audienceSegment.id, audienceSegment)
    } else {
      createOrUpdatePromise = AudienceSegmentService.createAudienceSegment(organisationId, audienceSegment)
    }

    return createOrUpdatePromise;

  },

  // TODO return type (JobExec...)
  createOverlap(datamartId: string, segmentId: string): Promise<any> {
    const endpoint = `datamarts/${datamartId}/overlap_analysis`;
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

    return ApiService.postRequest(endpoint, body);
  },

  retrieveOverlap(
    segmentId: string,
    options: {
      first_result?: number;
      max_results?: number;
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
  getSegmentMetaData(organisationId: string): Promise<any> {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
    ).then(res =>
      normalizeArrayOfObject(
        normalizeReportView(res.data.report_view),
        'audience_segment_id',
      ),
    );
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
    ]).then(([segmentApiResp, metadata]) => {
      const augmentedSegments = segmentApiResp.data.map((segment: any) => {
        const meta = metadata[segment.id];
        const userPoints = meta && meta.user_points ? meta.user_points : '-';
        const desktopCookieIds =
          meta && meta.desktop_cookie_ids ? meta.desktop_cookie_ids : '-';

        return {
          ...segment,
          user_points: userPoints,
          desktop_cookie_ids: desktopCookieIds,
        };
      });

      return {
        ...segmentApiResp,
        data: augmentedSegments,
      };
    });
  },

  createAudienceSegment(organisationId: string, options: object = {}): Promise<DataResponse<AudienceSegment>> {
    const endpoint = `audience_segments?organisation_id=${organisationId}`;
    const params = {
      ...options,
    };
    return ApiService.postRequest(endpoint, params);
  },
};

export default AudienceSegmentService;
