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

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "accounts",
      hidden: true,
      id: "1",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "activities",
      hidden: true,
      id: "2",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "creation_ts",
      hidden: true,
      id: "3",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "emails",
      hidden: true,
      id: "4",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "segments",
      hidden: true,
      id: "5",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "agents",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "User Agents",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "events",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "User Events",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserPoint",
      field_name: "profiles",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Profiles",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserAgent",
      field_name: "id",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserAgent",
      field_name: "user_agent_info",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "User Agent Info",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserAgent",
      field_name: "creation_ts",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Creation Date",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserAgentInfo",
      field_name: "agent_type",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Agent Type",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserAgentInfo",
      field_name: "browser_family",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Browser Family",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "date",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Date",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "name",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Event Name"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "channel_id",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "channel_type",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "page",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Page",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserEvent",
      field_name: "purchase",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Purchase",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "breadcrumb",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "c1",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "c2",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "c3",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "c4",
      hidden: true,
      id: "6",
      language: "EN_us",
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "keywords",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Keywords"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "page_name",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Page Name"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Page",
      field_name: "products",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Products"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "id",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "name",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Name"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "brand",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Brand"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "unit_price",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Unit Price"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "id",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Product",
      field_name: "unit_price",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Unit Price"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "id",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "delivery_date",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "payment_mode",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "items",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "channel",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Channel"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "delivery_mode",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Delivery Mode"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "point_of_sale",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Point Of Sale"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Purchase",
      field_name: "total_amount",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Total Amount"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "birth_date",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Birth Date"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "gender",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Gender"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "optins",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Opt Ins"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "scoring",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Scoring"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "compartment_id",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Member"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "id",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "employee",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "UserProfile",
      field_name: "user_account_id",
      hidden: true,
      id: "6",
      language: "EN_us"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Optins",
      field_name: "print",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Print"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Optins",
      field_name: "email",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Email"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Optins",
      field_name: "email",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "SMS"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Optins",
      field_name: "email",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Tel"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "Scoring",
      field_name: "crossCanal",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Cross-Channel"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "CrossCanalTimeFrame",
      field_name: "months_12",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Cross-channel 12"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "CrossCanalTimeFrame",
      field_name: "months_24",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Cross-channel 24"
    },
    {

      datamart_id: "1297",
      schema_id: "287",
      object_name: "CrossCanalTimeFrame",
      field_name: "months_36",
      hidden: false,
      id: "6",
      language: "EN_us",
      label: "Cross-channel 36"
    },
  ]