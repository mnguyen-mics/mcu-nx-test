import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  RuntimeSchemaResource,
  ObjectLikeTypeResource,
  FieldResource,
} from '../models/datamart/graphdb/RuntimeSchema';

const RuntimeSchemaService = {
  getRuntimeSchemas(
    datamartId: string,
  ): Promise<DataListResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas`,
    );
  },

  getRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}`,
    );
  },

  getObjectTypes(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataListResponse<ObjectLikeTypeResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types`,
    );
  },

  getObjectType(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ): Promise<DataResponse<ObjectLikeTypeResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}`,
    );
  },

  getFields(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ): Promise<DataListResponse<FieldResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields`,
    );
  },

  getField(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
  ): Promise<DataResponse<FieldResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}`,
    );
  },
};

export default RuntimeSchemaService;
