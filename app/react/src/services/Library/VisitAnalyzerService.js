import ApiService from '../ApiService';
import PluginService from '../PluginService';

const getVisitAnalyzers = (organisationId, options = {}) => {
  const endpoint = 'visit_analyzer_models';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const deleteVisitAnalyzerProperty = (id, options = {}) => {
  const endpoint = `visit_analyzer_models/${id}`;

  return ApiService.deleteRequest(endpoint, options);
};

const getVisitAnalyzerProperty = (id, options = {}) => {
  const endpoint = `visit_analyzer_models/${id}/properties`;

  return ApiService.getRequest(endpoint, options);
};

const getVisitAnalyzer = (id, options = {}) => {
  const endpoint = `visit_analyzer_models/${id}`;

  const params = {
    ...options,
  };
  return ApiService.getRequest(endpoint, params);
};

const createVisitAnalyzer = (organisationId, options = {}) => {
  const endpoint = `visit_analyzer_models?organisation_id=${organisationId}`;

  const params = {
    ...options,
  };

  return ApiService.postRequest(endpoint, params);
};

const updateVisitAnalyzer = (id, options = {}) => {
  const endpoint = `visit_analyzer_models/${id}`;

  const params = {
    ...options,
  };

  return ApiService.putRequest(endpoint, params);
};

const updateVisitAnalyzerProperty = (organisationId, id, technicalName, params = {}) => {
  const endpoint = `visit_analyzer_models/${id}/properties/technical_name=${technicalName}`;
  return PluginService.handleSaveOfProperties(params, organisationId, 'visit_analyzer_models', id, endpoint);
};

export default {
  getVisitAnalyzers,
  getVisitAnalyzerProperty,
  getVisitAnalyzer,
  createVisitAnalyzer,
  updateVisitAnalyzer,
  updateVisitAnalyzerProperty,
  deleteVisitAnalyzerProperty,
};
