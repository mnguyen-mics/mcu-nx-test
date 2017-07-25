import ApiService from './ApiService';

const getSegments = (organisationId, datamartId, options = {}) => {
  const endpoint = 'audience_segments';

  const params = {
    organisation_id: organisationId,
    datamart_id: datamartId,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getSegment = (segmentId, options = {}) => {
  const endpoint = `audience_segments/${segmentId}`;

  const params = {
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const createOverlap = (datamartId, segmentId) => {
  const endpoint = `datamarts/${datamartId}/overlap_analysis`;

  const body = { first_party_overlap: { source: { type: 'segment_overlap', segment_id: segmentId, datamart_id: datamartId }, type: 'FIRST_PARTY_OVERLAP' } };
  const header = { 'Content-Type': 'application/json' };
  return ApiService.postRequest(endpoint, body, {}, header);
};

const retrieveOverlap = (segmentId, firstResult, maxResult) => {
  const endpoint = `audience_segments/${segmentId}/overlap_analysis`;
  const params = {
    audienceSegmentId: segmentId,
    first_result: firstResult,
    max_results: maxResult
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getSegments,
  getSegment,
  createOverlap,
  retrieveOverlap
};
