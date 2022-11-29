import { DatamartReplicationResourceShape } from './../../../../../models/settings/settings';

export type DatamartReplicationFormData = Partial<DatamartReplicationResourceShape>;

export const INITIAL_DATAMART_REPLICATION_FORM_DATA: DatamartReplicationFormData = {
  status: 'PAUSED',
};

export interface DatamartReplicationRouteMatchParam {
  organisationId: string;
  datamartId: string;
  datamartReplicationId: string;
}
