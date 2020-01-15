import { DatamartReplicationResource } from '../../../../../models/settings/settings';

export type DatamartReplicationFormData = Partial<DatamartReplicationResource>;

export const INITIAL_DATAMART_REPLICATION_FORM_DATA: DatamartReplicationFormData = {};

export interface DatamartReplicationRouteMatchParam {
  organisationId: string;
  datamartId: string;
  datamartReplicationId: string;
}
