import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  RuntimeSchemaResource,
  ObjectLikeTypeResource,
  FieldResource,
  FieldDirectiveResource,
  ObjectLikeTypeDirectiveResource,
  DirectiveArgumentResource,
  ObjectLikeTypeInfoResource,
  SchemaDecoratorResource,
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
                  return Promise.all([RuntimeSchemaService.getFieldDirectives(
                    datamartId,
                    runtimeSchemaId,
                    object.id,
                    field.id,
                  ),
                  RuntimeSchemaService.getFieldDecorator(datamartId, runtimeSchemaId, object.name, field.name)
                ]).then(dirRes => {
                    return Promise.all(dirRes[0].data.map(dir => {
                      return RuntimeSchemaService.getFieldDirectiveArguments(
                        datamartId,
                        runtimeSchemaId,
                        object.id,
                        field.id,
                        dir.id
                      ).then(fieldDirArgs => {
                        return {
                          ...dir,
                          arguments: fieldDirArgs.data,
                        };
                      });
                    })).then((fieldDirectives) => {
                      const decorator = dirRes[1]; 
                      return {...field, directives: fieldDirectives, decorator: decorator ? decorator.data : undefined} 
                    });
                  })
                }),
              );
            })])
            .then(([objectTypeDirectives,fields]) => ({ ...object, fields, directives: objectTypeDirectives}));
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
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}/arguments`,
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
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}/arguments/${argumentId}`,
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

    getFieldDirectiveArguments(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      fieldId: string,
      directiveId: string,
    ): Promise<DataListResponse<DirectiveArgumentResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}/directives/${directiveId}/arguments`,
      );
    },

    getFieldDirectiveArgument(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeId: string,
      fieldId: string,
      directiveId: string,
      argumentId: string,
    ): Promise<DataResponse<DirectiveArgumentResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}/directives/${directiveId}/arguments/${argumentId}`,
      );
    },
    getFieldDecorator(
      datamartId: string,
      runtimeSchemaId: string,
      objectTypeName: string,
      fieldName: string,
    ): Promise<DataResponse<SchemaDecoratorResource> | undefined> {
      return new Promise((resolve, reject) => {
        const decorator = findInFakeData(datamartId, runtimeSchemaId, objectTypeName, fieldName);
        if (decorator) {
          return resolve({ status: "ok", data: decorator})
        }
        return resolve(undefined)
        
      })
    }
  };
  
  export default RuntimeSchemaService;

  const findInFakeData = (datamartId: string, runtimeSchemaId: string, objectTypeName: string, fieldName: string) => {
    return fakeData.find(f => f.datamart_id === datamartId && f.schema_id === runtimeSchemaId && f.object_name === objectTypeName && f.field_name === fieldName)
  }

  const fakeData: SchemaDecoratorResource[] = [
    {

      datamart_id: "1162",
      schema_id: "275",
      field_name: "activity_events",
      help_text: "ceci est un evenement",
      label: "Evenement",
      hidden: false,
      id: "1",
      language: "EN_us",
      object_name: "UserPoint"
    },
    {
      datamart_id: "1162",
      schema_id: "275",
      field_name: "app_id",
      help_text: "this is the channel id used by the user",
      label: "Application Identifier",
      hidden: false,
      id: "1",
      language: "EN_us",
      object_name: "ActivityEvent"
    }
  ]