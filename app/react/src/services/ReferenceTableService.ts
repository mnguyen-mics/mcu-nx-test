import ApiService, { DataListResponse } from './ApiService';

export interface PlatformResource {
  display_value: string;
  value: string;
}

const ReferenceTableService = {
  getReferenceTable(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeName: string,
    fieldName: string,
  ): Promise<DataListResponse<PlatformResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/field/index=USER_INDEX/object_tree_field_path=${objectTypeName}.${fieldName}/reference_tables/records`,
    );
  },
};
  
export default ReferenceTableService;