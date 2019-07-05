import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  RuntimeSchemaResource,
  RuntimeSchemaValidationResource,
} from '../models/datamart/graphdb/RuntimeSchema';

const TableSchemaService = {
  getTableSchemas(
    datamartId: string,
  ): Promise<DataListResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas`,
    );
  },
  
  getTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}`,
    );
  },

  getTableSchemaText(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<string> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/text`,
    );
  },

  cloneTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/clone`,
      {}
    );
  },

  validateTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/validation`,
      {}
    );
  },

  publishTableSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_table_schemas/${runtimeSchemaId}/publication`,
      {}
    );
  },
  

  };
  
  export default TableSchemaService;

 