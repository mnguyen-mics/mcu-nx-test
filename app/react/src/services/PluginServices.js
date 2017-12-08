import ApiService from './ApiService.ts';

function getEngineProperties(engineVersionId) {
  const endpoint = `plugins/${engineVersionId}/properties`;

  return ApiService.getRequest(endpoint).then(res => res.data);
}

function getEngineVersion(engineVersionId, id) {
  const endpoint = `plugins/version/${engineVersionId}`;

  return ApiService.getRequest(endpoint).then(res => {
    return { ...res.data, id };
  });
}


export default {
  getEngineProperties,
  getEngineVersion,
};
