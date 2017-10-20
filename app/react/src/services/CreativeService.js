import ApiService from './ApiService';

const getCreatives = (organisationId, options = {}) => {
  const endpoint = 'creatives';

  const params = {
    organisation_id: organisationId,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getCreative = creativeId => {
  const endpoint = `creatives/${creativeId}`;
  return ApiService.getRequest(endpoint).then(res => res.data);
};

const getDisplayAds = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'DISPLAY_AD', ...options });
};

const getEmailTemplates = (organisationId, options = {}) => {
  return getCreatives(organisationId, { creative_type: 'EMAIL_TEMPLATE', ...options });
};

const getEmailTemplate = templateId => {
  return getCreative(templateId);
};

const getCreativeFormats = (organisationId, options = {}) => {
  const endpoint = 'reference_tables/formats';
  const params = {
    ...options,
    organisation_id: organisationId
  };
  return ApiService.getRequest(endpoint, params).then(res => res.data);
};

const createDisplayCreative = (organisationId, options = {}) => {
  const endpoint = 'display_ads';
  const params = {
    ...options,
    type: 'DISPLAY_AD',
    organisation_id: organisationId
  };
  return ApiService.postRequest(endpoint, params).then(res => res.data);
};

const updateDisplayCreative = (organisationId, creativeId, options = {}) => {
  const endpoint = `display_ads/${creativeId}`;
  const params = {
    ...options,
    type: 'DISPLAY_AD',
    organisation_id: organisationId
  };
  return ApiService.putRequest(endpoint, params).then(res => res.data);
};

const updateDisplayCreativeRendererProperty = (organisationId, creativeId, technicalName, params = {}) => {
  const endpoint = `display_ads/${creativeId}/renderer_properties/technical_name=${technicalName}`;
  if (params.property_type === 'ASSET') {
    const uploadEndpoint = `asset_files?organisation_id=${organisationId}`;
    if (params.value && params.value.length === 0) {
      return new Promise(resolve => {
        return resolve();
      });
    }

    const fileValue = (params.value && params.value.file) ? params.value.file : null;
    const formData = new FormData(); /* global FormData */
    formData.append('file', fileValue, fileValue.name);
    if (fileValue !== null) {
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
    console.log(params.value[0]);
    return ApiService.putRequest(endpoint, params.value[0]);


  }
  // } else if (technicalName === 'DATA_FILE') {
    // TODO UPLOAD DATA FILE
  // }
  return ApiService.putRequest(endpoint, params);
};

const getCreativeRendererProperties = (creativeId, options = {}) => {
  const endpoint = `display_ads/${creativeId}/renderer_properties`;
  return ApiService.getRequest(endpoint, options).then(res => res.data);
};


const getAuditStatus = (creativeId, options = {}) => {
  const endpoint = `display_ads/${creativeId}/audits`;
  return ApiService.getRequest(endpoint, options).then(res => res.data);
};

const postCreativeStatus = (creativeId, options = {}) => {
  const endpoint = `display_ads/${creativeId}/action`;
  return ApiService.postRequest(endpoint, options).then(res => res.data);
};

const takeScreenshot = (creativeId, organisationId, options = []) => {
  const endpoint = `creatives/${creativeId}/screenshots?organisation_id=${organisationId}`;
  return ApiService.postRequest(endpoint, options);
};
const getCreativeScreenshotStatus = creativeId => {
  const endpoint = `creatives/${creativeId}/screenshots/last`;
  return ApiService.getRequest(endpoint);
};


export default {
  getCreatives,
  getCreative,
  getDisplayAds,
  getEmailTemplates,
  getEmailTemplate,
  getCreativeFormats,
  createDisplayCreative,
  updateDisplayCreativeRendererProperty,
  getCreativeRendererProperties,
  getAuditStatus,
  postCreativeStatus,
  takeScreenshot,
  updateDisplayCreative,
  getCreativeScreenshotStatus,
};
