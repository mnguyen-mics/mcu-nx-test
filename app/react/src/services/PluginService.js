import ApiService from './ApiService';

const getPluginVersions = (pluginId, params = {}) => {
  const endpoint = `plugins/${pluginId}/versions`;
  return ApiService.getRequest(endpoint, params);
};

const getPluginVersionProperty = (pluginId, pluginVersionId, params = {}) => {
  const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties`;
  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

const getAdLayouts = (organisationId, rendererVersionId) => {
  const endpoint = `ad_layouts?organisation_id=${organisationId}&renderer_version_id=${rendererVersionId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getAdLayoutVersion = (organisationId, adLayoutVersion) => {
  const endpoint = `ad_layouts/${adLayoutVersion}/versions`;
  const params = {
    organisation_id: organisationId,
    statuses: 'DRAFT,PUBLISHED'
  };
  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

const getStyleSheets = (organisationId) => {
  const endpoint = `style_sheets?organisation_id=${organisationId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getStyleSheetsVersion = (organisationId, styleSheetId) => {
  const endpoint = `style_sheets/${styleSheetId}/versions`;
  const params = {
    organisation_id: organisationId,
    statuses: 'DRAFT,PUBLISHED'
  };
  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

export default {
  getPluginVersions,
  getPluginVersionProperty,
  getAdLayouts,
  getAdLayoutVersion,
  getStyleSheets,
  getStyleSheetsVersion,
};
