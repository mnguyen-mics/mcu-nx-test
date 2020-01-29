import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  RuntimeSchemaResource,
  RuntimeSchemaValidationResource,
} from '../models/datamart/graphdb/RuntimeSchema';
import { injectable } from 'inversify';

export interface ITableSchemaService {
  getTableSchemas: (
    datamartId: string,
  ) => Promise<DataListResponse<RuntimeSchemaResource>>;

  getTableSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaResource>>;

  getTableSchemaText: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<string>;

  cloneTableSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaResource>>;

  validateTableSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaValidationResource>>;

  publishTableSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaValidationResource>>;
}

@injectable()
export class TableSchemaService implements ITableSchemaService {
  getTableSchemas(
    datamartId: string,
  ): Promise<DataListResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas`,
    );
  }

  getTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}`,
    );
  }

  getTableSchemaText(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<string> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/text`,
    );
  }

  cloneTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/clone`,
      {},
    );
  }

  validateTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/validation`,
      {},
    );
  }

  publishTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/publication`,
      {},
    );
  }
}
