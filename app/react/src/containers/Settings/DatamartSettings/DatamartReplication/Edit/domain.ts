import {
  DatamartReplicationResourceShape,
  PubSubReplicationResource,
} from './../../../../../models/settings/settings';

export type DatamartReplicationFormData = Partial<
  DatamartReplicationResourceShape
>;

export const INITIAL_DATAMART_REPLICATION_FORM_DATA: DatamartReplicationFormData = {
  status: 'PAUSED',
};

export interface DatamartReplicationRouteMatchParam {
  organisationId: string;
  datamartId: string;
  datamartReplicationId: string;
}

export function isPubSubReplication(
  replication: DatamartReplicationResourceShape,
): replication is PubSubReplicationResource {
  return !!replication.project_id && !!replication.topic_id;
}
