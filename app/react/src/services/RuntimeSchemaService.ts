import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  RuntimeSchemaResource,
  ObjectLikeTypeResource,
  FieldResource,
  FieldDirectiveResource,
  ObjectLikeTypeDirectiveResource,
  DirectiveArgumentResource,
  ObjectLikeTypeInfoResource,
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
  
  getObjectTypeInfoResources(
    datamartId: string,
    runtimeSchemaId: string,
  ):Promise<ObjectLikeTypeInfoResource[]>{ 
    return RuntimeSchemaService.getObjectTypes(
      datamartId,
      runtimeSchemaId,
    ).then(objectRes => {
      return Promise.all(
        objectRes.data.map(object => {       
          return Promise.all([
            RuntimeSchemaService.getObjectTypeDirectives(
              datamartId,
              runtimeSchemaId,
              object.id
            ).then(obTypeDirs => {
              return Promise.all(obTypeDirs.data.map(dir => {
                return RuntimeSchemaService.getObjectTypeDirectiveArguments(
                  datamartId,
                  runtimeSchemaId,
                  object.id,
                  dir.id
                ).then(dirArgs => {
                  return {
                    ...dir,
                    arguments: dirArgs.data,
                  };
                })                                
              }))            
            }),
            RuntimeSchemaService.getFields(
              datamartId,
              runtimeSchemaId,
              object.id,
            ).then(fieldRes => {
              return Promise.all(
                fieldRes.data.map(field => {
                  return RuntimeSchemaService.getFieldDirectives(
                    datamartId,
                    runtimeSchemaId,
                    object.id,
                    field.id,
                  ).then(dirRes => ({ ...field, directives: dirRes.data }));
                }),
              );
            })])
            .then(([directives,fields]) => ({ ...object, fields, directives}));
          }),
        );
      });
    },
    
    getObjectTypeDirectives(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
    ): Promise<DataListResponse<ObjectLikeTypeDirectiveResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives`,
      );
    },
    
    getObjectTypeDirective(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      directiveId: string,
    ): Promise<DataResponse<ObjectLikeTypeDirectiveResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}`,
      );
    },
    
    getObjectTypeDirectiveArguments(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      directiveId: string,
    ): Promise<DataListResponse<DirectiveArgumentResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}/inputValues`,
      );
    },
    
    getObjectTypeDirectiveArgument(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      directiveId: string,
      argumentId: string,
    ): Promise<DataResponse<DirectiveArgumentResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}/inputValues/${argumentId}`,
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
    
    getFieldDirectives(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      fieldId: string,
    ): Promise<DataListResponse<FieldDirectiveResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}/directives`,
      );
    },
    
    getFieldDirective(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      fieldId: string,
      directiveId: string,
    ): Promise<DataResponse<FieldDirectiveResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}/directives/${directiveId}`,
      );
    },
  };
  
  export default RuntimeSchemaService;
  