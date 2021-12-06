import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';

export interface PlatformResource {
  display_value: string;
  value: string;
}

export interface IReferenceTableService {
  getReferenceTable: (
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeName: string,
    fieldName: string,
  ) => Promise<DataListResponse<PlatformResource>>;
}

@injectable()
export class ReferenceTableService implements IReferenceTableService {
  getReferenceTable(
    datamartId: string,
    runtimeSchemaId: string,
    objectTypeName: string,
    fieldName: string,
  ): Promise<DataListResponse<PlatformResource>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/graphdb_runtime_schemas/${runtimeSchemaId}/field/index=USER_INDEX/object_tree_field_path=${objectTypeName}.${fieldName}/reference_tables/records`,
    );
  }
}
