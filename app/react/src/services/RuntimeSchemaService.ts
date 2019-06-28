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
  RuntimeSchemaValidationResource,
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

  getRuntimeSchemaText(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<string> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/text`,
    );
  },

  cloneRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/clone`,
      {}
    );
  },

  validateRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/validation`,
      {}
    );
  },

  publishRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/publication`,
      {}
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

  getObjectTypesDeep(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataListResponse<ObjectLikeTypeInfoResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/deep`,
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
  ): Promise<ObjectLikeTypeInfoResource[]> {
    return RuntimeSchemaService.getObjectTypesDeep(
      datamartId,
      runtimeSchemaId
    ).then(res => {
      return res.data
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
    ): Promise<DataResponse<SchemaDecoratorResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators/object_name=${objectTypeName}/field_name=${fieldName}`
      )
    },
    getSchemaDecorator(
      datamartId: string,
      runtimeSchemaId: string,
    ): Promise<DataListResponse<SchemaDecoratorResource>> {
      return ApiService.getRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators`
      )
    },
    createSchemaDecorator(
      datamartId: string,
      runtimeSchemaId: string,
      blob: string
    ): Promise<DataListResponse<SchemaDecoratorResource>> {
      return ApiService.postRequest(
        `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators`,
        blob,
        {},
        { "Content-Type": "text/plain" }
      )
    }
  };
  
  export default RuntimeSchemaService;

 