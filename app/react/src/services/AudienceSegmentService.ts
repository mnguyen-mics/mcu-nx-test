import { ProcessingSelectionResource } from './../models/processing';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import ReportService from './ReportService';
import {
  AudienceSegmentType,
  UserQueryEvaluationMode,
  AudienceSegmentShape,
  OverlapJobResult,
} from '../models/audiencesegment/AudienceSegmentResource';
import { normalizeArrayOfObject } from '../utils/Normalizer';
import { normalizeReportView } from '../utils/MetricHelper';
import McsMoment from '../utils/McsMoment';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { PluginProperty, AudienceExternalFeed, AudienceTagFeed } from '../models/Plugins';

import { IPluginService } from './PluginService';
import { BaseExecutionResource } from '../models/Job/JobResource';
import { injectable, inject } from 'inversify';
import { TYPES } from '../constants/types';

export interface SegmentImportResult {
  total_user_segment_imported: number;
  total_user_segment_treated: number;
}

export interface SegmentExportInput {
  datamart_id: string;
  audience_segment_id: string;
  export_user_identifier: ExportUserIdentifier;
  mime_type: AudienceSegmentExportJobResultMimeType;
}

export interface ExportUserIdentifier {
  type: AudienceSegmentExportJobIdentifierType;
  compartment_id?: string;
}

export type AudienceSegmentExportJobIdentifierType = 'USER_ACCOUNT' | 'USER_EMAIL' | 'USER_AGENT';

export type AudienceSegmentExportJobResultMimeType = 'TEXT_CSV';

export interface SegmentExportResult {
  total_user_points_in_segment: number;
  total_user_points_with_identifiers: number;
  total_exported_user_points: number;
  total_exported_identifiers: number;
  export_file_uri: string;
}

export interface UserSegmentImportJobExecutionResource
  extends BaseExecutionResource<{}, SegmentImportResult> {
  job_type: 'USER_SEGMENT_IMPORT';
}

export interface AudienceSegmentExportJobExecutionResource
  extends BaseExecutionResource<SegmentExportInput, SegmentExportResult> {
  job_type: 'AUDIENCE_SEGMENT_EXPORT';
}

export type UserListFeedType = 'FILE_IMPORT' | 'TAG' | 'SCENARIO';

export interface GetSegmentsOption extends PaginatedApiParam {
  name?: string;
  technical_name?: string;
  type?: AudienceSegmentType[];
  evaluation_mode?: UserQueryEvaluationMode;
  with_source_datamarts?: boolean;
  campaign_id?: string;
  audience_partition_id?: string;
  persisted?: boolean;
  datamart_id?: string;
  keywords?: string;
  feed_type?: UserListFeedType;
}

export interface IAudienceSegmentService {
  getSegments: (
    organisationId?: string,
    options?: GetSegmentsOption,
  ) => Promise<DataListResponse<AudienceSegmentShape>>;

  getSegment: (segmentId: string) => Promise<DataResponse<AudienceSegmentShape>>;

  updateAudienceSegment: (
    segmentId: string,
    body: object,
  ) => Promise<DataResponse<AudienceSegmentShape>>;

  deleteAudienceSegment: (segmentId: string) => Promise<any>;

  saveSegment: (
    organisationId: string,
    audienceSegment: Partial<AudienceSegmentShape>,
  ) => Promise<DataResponse<AudienceSegmentShape>>;

  // TODO return type (JobExec...)
  createOverlap: (datamartId: string, segmentId: string) => Promise<any>;

  importUserList: (datamartId: string, file: FormData) => Promise<any>;

  importUserListForOneSegment: (
    datamartId: string,
    segmentId: string,
    file: FormData,
  ) => Promise<any>;

  findUserListImportExecutionsBySegment: (
    datamartId: string,
    segmentId: string,
    options?: {
      first_result?: number;
      max_results?: number;
      status?: string;
    },
  ) => Promise<DataListResponse<UserSegmentImportJobExecutionResource>>;

  retrieveOverlap: (
    segmentId: string,
    options: {
      first_result?: number;
      max_results?: number;
    },
  ) => Promise<DataListResponse<OverlapJobResult>>;

  createAudienceSegmentExport: (
    segmentId: string,
    exportUserIdentifier: ExportUserIdentifier,
    mimeType?: AudienceSegmentExportJobResultMimeType,
  ) => Promise<DataResponse<AudienceSegmentExportJobExecutionResource>>;

  findAudienceSegmentExportExecutionsBySegment: (
    segmentId: string,
    options?: {
      first_result?: number;
      max_results?: number;
      status?: string;
    },
  ) => Promise<DataListResponse<AudienceSegmentExportJobExecutionResource>>;

  // DEPRECATED, will be removed in a near future
  getSegmentMetaData: (organisationId: string) => Promise<any>;

  // DEPRECATED, will be removed in a near future
  getSegmentsWithMetadata: (organisationId: string, options: GetSegmentsOption) => Promise<any>;

  createAudienceSegment: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<AudienceSegmentShape>>;

  getAudienceExternalFeeds: (
    audienceSegmentId: string,
    options?: object,
  ) => Promise<DataListResponse<AudienceExternalFeed>>;
  getAudienceExternalFeed: (
    audienceSegmentId: string,
    feedId: string,
    options?: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;
  createAudienceExternalFeeds: (
    audienceSegmentId: string,
    audienceExternalFeed: Partial<AudienceExternalFeed>,
    options?: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;
  updateAudienceExternalFeeds: (
    audienceSegmentId: string,
    audienceExternalFeedId: string,
    audienceExternalFeed: Partial<AudienceExternalFeed>,
    options?: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;
  deleteAudienceExternalFeeds: (
    audienceSegmentId: string,
    audienceExternalFeedId: string,
    options?: object,
  ) => Promise<DataListResponse<AudienceExternalFeed>>;
  getAudienceExternalFeedProperties: (
    audienceSegmentId: string,
    feedId: string,
    options?: object,
  ) => Promise<DataListResponse<PluginProperty>>;
  getAudienceTagFeed: (
    audienceSegmentId: string,
    feedId: string,
    options?: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;
  getAudienceTagFeeds: (
    audienceSegmentId: string,
    options?: object,
  ) => Promise<DataListResponse<AudienceTagFeed>>;
  createAudienceTagFeeds: (
    audienceSegmentId: string,
    audienceTagFeed: Partial<AudienceTagFeed>,
    options?: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;
  updateAudienceTagFeeds: (
    audienceSegmentId: string,
    audienceTagFeedId: string,
    audienceTagFeed: Partial<AudienceTagFeed>,
    options?: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;
  deleteAudienceTagFeeds: (
    audienceSegmentId: string,
    audienceTagFeedId: string,
    options?: object,
  ) => Promise<DataListResponse<AudienceTagFeed>>;
  getAudienceTagFeedProperties: (
    audienceSegmentId: string,
    feedId: string,
    options?: object,
  ) => Promise<DataListResponse<PluginProperty>>;

  updateAudienceSegmentExternalFeedProperty: (
    organisationId: string,
    audienceSegmentId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PluginProperty> | void>;
  updateAudienceSegmentTagFeedProperty: (
    organisationId: string,
    audienceSegmentId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PluginProperty> | void>;
  recalibrateAudienceLookAlike: (segmentId: string) => Promise<DataResponse<void>>;
  getProcessingSelectionsByAudienceSegment: (
    segmentId: string,
  ) => Promise<DataListResponse<ProcessingSelectionResource>>;
  createProcessingSelectionForAudienceSegment: (
    segmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  getAudienceSegmentProcessingSelection: (
    segmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  deleteAudienceSegmentProcessingSelection: (
    segmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
}

@injectable()
export default class AudienceSegmentService implements IAudienceSegmentService {
  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  getSegments = (
    organisationId?: string,
    options: GetSegmentsOption = {},
  ): Promise<DataListResponse<AudienceSegmentShape>> => {
    const endpoint = 'audience_segments';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  };

  getSegment = (segmentId: string): Promise<DataResponse<AudienceSegmentShape>> => {
    const endpoint = `audience_segments/${segmentId}`;
    return ApiService.getRequest(endpoint);
  };

  updateAudienceSegment = (
    segmentId: string,
    body: object,
  ): Promise<DataResponse<AudienceSegmentShape>> => {
    const endpoint = `audience_segments/${segmentId}`;
    return ApiService.putRequest(endpoint, body);
  };

  deleteAudienceSegment = (segmentId: string): Promise<any> => {
    const endpoint = `audience_segments/${segmentId}`;
    return ApiService.deleteRequest(endpoint);
  };

  saveSegment = (
    organisationId: string,
    audienceSegment: Partial<AudienceSegmentShape>,
  ): Promise<DataResponse<AudienceSegmentShape>> => {
    let createOrUpdatePromise;
    if (audienceSegment.id) {
      createOrUpdatePromise = this.updateAudienceSegment(audienceSegment.id, audienceSegment);
    } else {
      createOrUpdatePromise = this.createAudienceSegment(organisationId, audienceSegment);
    }

    return createOrUpdatePromise;
  };

  // TODO return type (JobExec...)
  createOverlap = (datamartId: string, segmentId: string): Promise<any> => {
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
  };

  importUserList = (datamartId: string, file: FormData): Promise<any> => {
    const endpoint = `datamarts/${datamartId}/user_list_imports`;
    return ApiService.postRequest(endpoint, file);
  };

  importUserListForOneSegment = (
    datamartId: string,
    segmentId: string,
    file: FormData,
  ): Promise<any> => {
    const endpoint = `datamarts/${datamartId}/audience_segments/${segmentId}/user_list_imports`;
    return ApiService.postRequest(endpoint, file);
  };

  findUserListImportExecutionsBySegment = (
    datamartId: string,
    segmentId: string,
    options: {
      first_result?: number;
      max_results?: number;
      status?: string;
    } = {},
  ): Promise<DataListResponse<UserSegmentImportJobExecutionResource>> => {
    const endpoint = `datamarts/${datamartId}/audience_segments/${segmentId}/user_list_imports`;
    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  retrieveOverlap = (
    segmentId: string,
    options: {
      first_result?: number;
      max_results?: number;
    } = {},
  ): Promise<DataListResponse<OverlapJobResult>> => {
    const endpoint = `audience_segments/${segmentId}/overlap_analysis`;
    const params = {
      audienceSegmentId: segmentId,
      job_type: 'FIRST_PARTY_OVERLAP_ANALYSIS',
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  createAudienceSegmentExport = (
    segmentId: string,
    exportUserIdentifier: ExportUserIdentifier,
    mimeType: AudienceSegmentExportJobResultMimeType = 'TEXT_CSV',
  ): Promise<DataResponse<AudienceSegmentExportJobExecutionResource>> => {
    const endpoint = `audience_segments/${segmentId}/exports`;
    const body = {
      export_user_identifier: exportUserIdentifier,
      mime_type: mimeType,
    };

    return ApiService.postRequest(endpoint, body);
  };

  findAudienceSegmentExportExecutionsBySegment = (
    segmentId: string,
    options?: {
      first_result?: number;
      max_results?: number;
      status?: string;
    },
  ): Promise<DataListResponse<AudienceSegmentExportJobExecutionResource>> => {
    const endpoint = `audience_segments/${segmentId}/exports`;
    const params = { ...options };

    return ApiService.getRequest(endpoint, params);
  };

  // DEPRECATED, will be removed in a near future
  getSegmentMetaData = (organisationId: string): Promise<any> => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
    ).then(res =>
      normalizeArrayOfObject(normalizeReportView(res.data.report_view), 'audience_segment_id'),
    );
  };

  // DEPRECATED, will be removed in a near future
  getSegmentsWithMetadata = (
    organisationId: string,
    options: GetSegmentsOption = {},
  ): Promise<any> => {
    return Promise.all([
      this.getSegments(organisationId, options),
      this.getSegmentMetaData(organisationId),
    ]).then(([segmentApiResp, metadata]) => {
      const augmentedSegments = segmentApiResp.data.map((segment: any) => {
        const meta = metadata[segment.id];
        const userPoints = meta && meta.user_points ? meta.user_points : '-';
        const desktopCookieIds = meta && meta.desktop_cookie_ids ? meta.desktop_cookie_ids : '-';

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
  };

  createAudienceSegment = (
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceSegmentShape>> => {
    const endpoint = `audience_segments?organisation_id=${organisationId}`;
    const params = {
      ...options,
    };
    return ApiService.postRequest(endpoint, params);
  };

  getAudienceExternalFeeds = (
    audienceSegmentId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds`;
    return ApiService.getRequest(endpoint);
  };
  getAudienceExternalFeed = (
    audienceSegmentId: string,
    feedId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${feedId}`;
    return ApiService.getRequest(endpoint);
  };
  createAudienceExternalFeeds = (
    audienceSegmentId: string,
    audienceExternalFeed: Partial<AudienceExternalFeed>,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds`;
    return ApiService.postRequest(endpoint, audienceExternalFeed);
  };
  updateAudienceExternalFeeds = (
    audienceSegmentId: string,
    audienceExternalFeedId: string,
    audienceExternalFeed: Partial<AudienceExternalFeed>,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${audienceExternalFeedId}`;
    return ApiService.putRequest(endpoint, audienceExternalFeed);
  };
  deleteAudienceExternalFeeds = (
    audienceSegmentId: string,
    audienceExternalFeedId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${audienceExternalFeedId}`;
    return ApiService.deleteRequest(endpoint);
  };
  getAudienceExternalFeedProperties = (
    audienceSegmentId: string,
    feedId: string,
    options: object = {},
  ): Promise<DataListResponse<PluginProperty>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${feedId}/properties`;
    return ApiService.getRequest(endpoint);
  };
  getAudienceTagFeed = (
    audienceSegmentId: string,
    feedId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds/${feedId}`;
    return ApiService.getRequest(endpoint);
  };
  getAudienceTagFeeds = (
    audienceSegmentId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds`;
    return ApiService.getRequest(endpoint);
  };
  createAudienceTagFeeds = (
    audienceSegmentId: string,
    audienceTagFeed: Partial<AudienceTagFeed>,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds`;
    return ApiService.postRequest(endpoint, audienceTagFeed);
  };
  updateAudienceTagFeeds = (
    audienceSegmentId: string,
    audienceTagFeedId: string,
    audienceTagFeed: Partial<AudienceTagFeed>,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds/${audienceTagFeedId}`;
    return ApiService.putRequest(endpoint, audienceTagFeed);
  };
  deleteAudienceTagFeeds = (
    audienceSegmentId: string,
    audienceTagFeedId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds/${audienceTagFeedId}`;
    return ApiService.deleteRequest(endpoint);
  };
  getAudienceTagFeedProperties = (
    audienceSegmentId: string,
    feedId: string,
    options: object = {},
  ): Promise<DataListResponse<PluginProperty>> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds/${feedId}/properties`;
    return ApiService.getRequest(endpoint);
  };

  updateAudienceSegmentExternalFeedProperty = (
    organisationId: string,
    audienceSegmentId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PluginProperty> | void> => {
    const endpoint = `audience_segments/${audienceSegmentId}/external_feeds/${id}/properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'attribution_models',
      id,
      endpoint,
    );
  };

  updateAudienceSegmentTagFeedProperty = (
    organisationId: string,
    audienceSegmentId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PluginProperty> | void> => {
    const endpoint = `audience_segments/${audienceSegmentId}/tag_feeds/${id}/properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'attribution_models',
      id,
      endpoint,
    );
  };

  recalibrateAudienceLookAlike = (segmentId: string): Promise<DataResponse<void>> => {
    const endpoint = `audience_segment_lookalikes/${segmentId}/calibrate`;
    return ApiService.postRequest(endpoint, {});
  };

  getProcessingSelectionsByAudienceSegment(
    segmentId: string,
  ): Promise<DataListResponse<ProcessingSelectionResource>> {
    const endpoint = `audience_segments/${segmentId}/processing_selections`;
    return ApiService.getRequest(endpoint);
  }
  createProcessingSelectionForAudienceSegment(
    segmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `audience_segments/${segmentId}/processing_selections`;
    return ApiService.postRequest(endpoint, body);
  }
  getAudienceSegmentProcessingSelection(
    segmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `audience_segments/${segmentId}/processing_selections/${processingSelectionId}`;
    return ApiService.getRequest(endpoint);
  }
  deleteAudienceSegmentProcessingSelection(
    segmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `audience_segments/${segmentId}/processing_selections/${processingSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
