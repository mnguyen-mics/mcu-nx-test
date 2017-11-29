import ApiService from './ApiService';

const getDatafileData = (dataFilePath) => {
  const endpoint = 'data_file/data';
  const params = {
    uri: dataFilePath,
  };

  return ApiService.getRequest(endpoint, params);
};

const createDatafile = (organisationId, object, objectId, fileName, formData) => {
  const uri = `mics://data_file/tenants/${organisationId}/bid_optimizer/${objectId}/${fileName}`;
  const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;

  return ApiService.putRequest(endpoint, formData).then(() => uri);
};

const editDataFile = (fileName, uri, formData) => {
  const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;
  return ApiService.putRequest(endpoint, formData);
};


export default {
  getDatafileData,
  createDatafile,
  editDataFile,
};
