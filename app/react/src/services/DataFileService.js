import ApiService from './ApiService';

const getDatafileData = (dataFilePath) => {
  const endpoint = 'data_file/data';
  const params = {
    uri: dataFilePath,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getDatafileData,
};
