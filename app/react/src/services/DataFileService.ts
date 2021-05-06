import ApiService, { DataResponse } from './ApiService';
import { injectable } from 'inversify';

export interface IDataFileService {
  getDatafileData: (dataFilePath: string) => Promise<Blob>;
  createDatafile: (
    organisationId: string,
    objectType: string,
    objectId: string,
    fileName: string,
    formData: Blob,
  ) => Promise<string>;
  editDataFile: (fileName: string, uri: string, formData: Blob) => Promise<DataResponse<any>>;
}

@injectable()
export default class DataFileService implements IDataFileService {
  getDatafileData(dataFilePath: string): Promise<Blob> {
    const endpoint = `data_file/data`;
    const params = {
      uri: dataFilePath,
      'cache-bust': Date.now(),
    };

    return ApiService.getRequest(endpoint, params);
  }
  createDatafile(
    organisationId: string,
    objectType: string,
    objectId: string,
    fileName: string,
    formData: Blob,
  ): Promise<string> {
    const uri = `mics://data_file/tenants/${organisationId}/${objectType}/${objectId}/${fileName}`;
    const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;

    return ApiService.putRequest(endpoint, formData).then(() => uri);
  }
  editDataFile(fileName: string, uri: string, formData: Blob): Promise<DataResponse<any>> {
    const endpoint = `data_file/data?uri=${uri}&name=${fileName}`;
    return ApiService.putRequest(endpoint, formData);
  }
}
