import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';

export type AudiencePartitionFormData = Partial<AudiencePartitionResource>;

export const INITIAL_AUDIENCE_PARTITION_FORM_DATA: AudiencePartitionFormData = {
  name: '',
  clustering_model_data_file_uri: '',
};
