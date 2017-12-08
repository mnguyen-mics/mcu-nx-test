import moment from 'moment';

import ApiService from './ApiService.ts';
import ReportService from './ReportService.ts';
import { normalizeArrayOfObject } from '../utils/Normalizer';
import { normalizeReportView } from '../utils/MetricHelper';
import McsMoment from '../utils/McsMoment.ts';

const getSegments = (organisationId, datamartId, options = {}) => {
  const endpoint = 'audience_segments';

  const params = {
    organisation_id: organisationId,
    datamart_id: datamartId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getSegment = (segmentId, options = {}) => {
  const endpoint = `audience_segments/${segmentId}`;

  const params = {
    ...options,
  };

  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

const getSegmentMetaData = (organisationId) => {
  return ReportService.getAudienceSegmentReport(
    organisationId,
    new McsMoment('now'),
    new McsMoment('now'),
    'audience_segment_id',
  )
    .then(res => normalizeArrayOfObject(
      normalizeReportView(res.data.report_view),
      'audience_segment_id',
    ));
};

const getSegmentsWithMetadata = (organisationId, datamartId, options = {}) => {
  return Promise.all([
    getSegments(organisationId, datamartId, options),
    getSegmentMetaData(organisationId),
  ])
    .then(([segmentApiResp, metadata]) => {
      const augmentedSegments = segmentApiResp.data.map(segment => {
        const meta = metadata[segment.id];
        const userPoints = (meta && meta.user_points ? meta.user_points : '-');
        const desktopCookieIds = (meta && meta.desktop_cookie_ids ? meta.desktop_cookie_ids : '-');

        return { ...segment, user_points: userPoints, desktop_cookie_ids: desktopCookieIds };
      });

      return {
        ...segmentApiResp,
        data: augmentedSegments
      };
    });
};

const createOverlap = (datamartId, segmentId) => {
  const endpoint = `datamarts/${datamartId}/overlap_analysis`;
  const header = { 'Content-Type': 'application/json' };
  const body = {
    first_party_overlap: {
      source: {
        type: 'segment_overlap',
        segment_id: segmentId,
        datamart_id: datamartId
      },
      type: 'FIRST_PARTY_OVERLAP'
    }
  };

  return ApiService.postRequest(endpoint, body, {}, header);
};

const retrieveOverlap = (segmentId, firstResult, maxResult) => {
  const endpoint = `audience_segments/${segmentId}/overlap_analysis`;
  const params = {
    audienceSegmentId: segmentId,
    first_result: firstResult,
    max_results: maxResult,
  };

  return ApiService.getRequest(endpoint, params);
};

const getEmailCount = (datamartId, segmentIds = [], providerTns = []) => {
  const endpoint = `datamarts/${datamartId}/email_blast_query`;

  const params = {};
  if (segmentIds.length > 0) params.segment_ids = segmentIds;
  if (providerTns.length > 0) params.provider_technical_names = providerTns;

  return ApiService.getRequest(endpoint, params);
};

export default {
  getSegment,
  getSegmentMetaData,
  getSegmentsWithMetadata,
  getSegments,
  getEmailCount,
  createOverlap,
  retrieveOverlap,
};
