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
  RuntimeSchemaValidationInfoResource,
  RuntimeSchemaPublicationInfoResource
} from '../models/datamart/graphdb/RuntimeSchema';
import { injectable } from 'inversify';

export interface IRuntimeSchemaService {
  getRuntimeSchemas: (
    datamartId: string,
  ) => Promise<DataListResponse<RuntimeSchemaResource>>;

  getRuntimeSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaResource>>;

  getRuntimeSchemaText: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<string>;

  updateRuntimeSchema: (
    datamartId: string,
    runtimeSchemaId: string,
    runtimeSchema: string,
  ) => Promise<DataResponse<RuntimeSchemaResource>>;

  cloneRuntimeSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaResource>>;

  validateRuntimeSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaValidationInfoResource>>;

  publishRuntimeSchema: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataResponse<RuntimeSchemaPublicationInfoResource>>;

  getObjectTypes: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataListResponse<ObjectLikeTypeResource>>;

  getObjectTypesDeep: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataListResponse<ObjectLikeTypeInfoResource>>;

  getObjectType: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ) => Promise<DataResponse<ObjectLikeTypeResource>>;

  getObjectTypeInfoResources: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<ObjectLikeTypeInfoResource[]>;

  getObjectTypeDirectives: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ) => Promise<DataListResponse<ObjectLikeTypeDirectiveResource>>;

  getObjectTypeDirective: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    directiveId: string,
  ) => Promise<DataResponse<ObjectLikeTypeDirectiveResource>>;

  getObjectTypeDirectiveArguments: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    directiveId: string,
  ) => Promise<DataListResponse<DirectiveArgumentResource>>;

  getObjectTypeDirectiveArgument: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    directiveId: string,
    argumentId: string,
  ) => Promise<DataResponse<DirectiveArgumentResource>>;

  getFields: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ) => Promise<DataListResponse<FieldResource>>;

  getField: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
  ) => Promise<DataResponse<FieldResource>>;

  getFieldDirectives: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
  ) => Promise<DataListResponse<FieldDirectiveResource>>;

  getFieldDirective: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
    directiveId: string,
  ) => Promise<DataResponse<FieldDirectiveResource>>;

  getFieldDirectiveArguments: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
    directiveId: string,
  ) => Promise<DataListResponse<DirectiveArgumentResource>>;

  getFieldDirectiveArgument: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
    directiveId: string,
    argumentId: string,
  ) => Promise<DataResponse<DirectiveArgumentResource>>;

  getFieldDecorator: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeName: string,
    fieldName: string,
  ) => Promise<DataResponse<SchemaDecoratorResource>>;
  getSchemaDecorator: (
    datamartId: string,
    runtimeSchemaId: string,
  ) => Promise<DataListResponse<SchemaDecoratorResource>>;
  createSchemaDecorator: (
    datamartId: string,
    runtimeSchemaId: string,
    blob: string,
  ) => Promise<DataListResponse<SchemaDecoratorResource>>;
}

@injectable()
export class RuntimeSchemaService implements IRuntimeSchemaService {
  getRuntimeSchemas(
    datamartId: string,
  ): Promise<DataListResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas`,
    );
  }

  getRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}`,
    );
  }

  getRuntimeSchemaText(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<string> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/text`,
    );
  }

  updateRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
    runtimeSchema: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.putRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/text`,
      runtimeSchema,
      {},
      { 'Content-Type': 'text/plain' },
    );
  }

  cloneRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/clone`,
      {},
    );
  }

  validateRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaValidationInfoResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/validation`,
      {},
    );
  }

  publishRuntimeSchema(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataResponse<RuntimeSchemaPublicationInfoResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/publication`,
      {},
    );
  }

  getObjectTypes(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataListResponse<ObjectLikeTypeResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types`,
    );
  }

  getObjectTypesDeep(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataListResponse<ObjectLikeTypeInfoResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/deep`,
    );
  }

  getObjectType(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ): Promise<DataResponse<ObjectLikeTypeResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}`,
    );
  }

  getObjectTypeInfoResources(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<ObjectLikeTypeInfoResource[]> {
    return this.getObjectTypesDeep(datamartId, runtimeSchemaId).then(res => {
      return res.data;
    });
  }

  getObjectTypeDirectives(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ): Promise<DataListResponse<ObjectLikeTypeDirectiveResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives`,
    );
  }

  getObjectTypeDirective(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    directiveId: string,
  ): Promise<DataResponse<ObjectLikeTypeDirectiveResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}`,
    );
  }

  getObjectTypeDirectiveArguments(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    directiveId: string,
  ): Promise<DataListResponse<DirectiveArgumentResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/directives/${directiveId}/arguments`,
    );
  }

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
  }

  getFields(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
  ): Promise<DataListResponse<FieldResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields`,
    );
  }

  getField(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
  ): Promise<DataResponse<FieldResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}`,
    );
  }

  getFieldDirectives(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeId: string,
    fieldId: string,
  ): Promise<DataListResponse<FieldDirectiveResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/object_types/${objectTypeId}/fields/${fieldId}/directives`,
    );
  }

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
  }

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
  }

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
  }
  getFieldDecorator(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeName: string,
    fieldName: string,
  ): Promise<DataResponse<SchemaDecoratorResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators/object_name=${objectTypeName}/field_name=${fieldName}`,
    );
  }
  getSchemaDecorator(
    datamartId: string,
    runtimeSchemaId: string,
  ): Promise<DataListResponse<SchemaDecoratorResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators`,
    );
  }
  createSchemaDecorator(
    datamartId: string,
    runtimeSchemaId: string,
    blob: string,
  ): Promise<DataListResponse<SchemaDecoratorResource>> {
    return ApiService.postRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/schema_decorators`,
      blob,
      {},
      { 'Content-Type': 'text/plain' },
    );
  }
}
