import ApiService, { DataResponse } from './ApiService';

const getDatafileData = (dataFilePath: string): Promise<DataResponse<any>> => {
  const endpoint = 'data_file/data';
  const params = {
    uri: dataFilePath,
  };

  return ApiService.getRequest(endpoint, params);
};

const createDatafile = (organisationId: string, object: any, objectId: string, fileName: string, formData: Blob): Promise<string> => {
  const uri = `mics://data_file/tenants/${organisationId}/bid_optimizer/${objectId}/${fileName}`;
  const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;

  return ApiService.putRequest(endpoint, formData).then(() => uri);
};

const editDataFile = (fileName: string, uri: string, formData: Blob): Promise<DataResponse<any>> => {
  const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;
  return ApiService.putRequest(endpoint, formData);
};


export default {
  getDatafileData,
  createDatafile,
  editDataFile,
};
