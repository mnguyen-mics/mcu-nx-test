import ApiService from './ApiService';
import DataFileService from './DataFileService';


const getPlugins = (options = {}) => {
  const endpoint = 'plugins';
  return ApiService.getRequest(endpoint, options);
};

const getPluginVersions = (pluginId, params = {}) => {
  const endpoint = `plugins/${pluginId}/versions`;
  return ApiService.getRequest(endpoint, params);
};

const getPluginVersionProperty = (pluginId, pluginVersionId, params = {}) => {
  const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties`;
  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

function getEngineProperties(engineVersionId) {
  const endpoint = `plugins/${engineVersionId}/properties`;

  return ApiService.getRequest(endpoint).then(res => res.data);
}

function getEngineVersion(engineVersionId) {
  const endpoint = `plugins/version/${engineVersionId}`;

  return ApiService.getRequest(endpoint).then(res => {
    return res.data;
  });
}

const getAdLayouts = (organisationId, pluginVersionId) => {
  const endpoint = `ad_layouts?organisation_id=${organisationId}&renderer_version_id=${pluginVersionId}`;
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


function handleSaveOfProperties(params, organisationId, objectType, objectId, endpoint) {
  if (params.property_type === 'ASSET') {
    const uploadEndpoint = `asset_files?organisation_id=${organisationId}`;
    if (params.value && params.value.length === 0) {
      return Promise.resolve();
    }

    const fileValue = (params.value && params.value.file) ? params.value.file : null;

    if (fileValue !== null) {
      const formData = new FormData(); /* global FormData */
      formData.append('file', fileValue, fileValue.name);
      return ApiService.postRequest(uploadEndpoint, formData)
      .then(res => {
        const newParams = {
          ...params
        };
        newParams.value = {
          original_file_name: res.data.original_filename,
          file_path: res.data.file_path,
          asset_id: res.data.id,
        };
        ApiService.putRequest(endpoint, newParams);
      });
    }
    return Promise.resolve();

  } else if (params.property_type === 'DATA_FILE') {
    // build formData
    const blob = new Blob([params.value.fileContent], { type: 'application/octet-stream' }); /* global Blob */
    if (params.value.uri) {
      // edit
      return DataFileService.editDataFile(params.value.fileName, params.value.uri, blob).then(() => {
        const newParams = {
          ...params
        };
        newParams.value = {
          uri: params.value.uri,
          last_modified: null,
        };
        return ApiService.putRequest(endpoint, newParams);
      });

    } else if (params.value.fileName && params.value.fileContent) {
      // create
      return DataFileService.createDatafile(organisationId, objectType, objectId, params.value.fileName, blob)
        .then(res => {
          const newParams = {
            ...params
          };
          newParams.value = {
            uri: res,
            last_modified: null,
          };
          return ApiService.putRequest(endpoint, newParams);
        });
    } else if (!params.value.fileName && !params.value.fileContent && !params.value.uri) {
      // delete
      const newParams = {
        ...params,
      };
      newParams.value = {
        uri: null,
        last_modified: null,
      };
      return ApiService.putRequest(endpoint, newParams);
    }
    return Promise.resolve();
  }

  return ApiService.putRequest(endpoint, params);
}

export default {
  getPlugins,
  getPluginVersions,
  getPluginVersionProperty,
  getAdLayouts,
  getAdLayoutVersion,
  getStyleSheets,
  getStyleSheetsVersion,
  getEngineProperties,
  getEngineVersion,
  handleSaveOfProperties,
};
