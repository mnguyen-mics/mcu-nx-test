export type AudiencePartitionType = 'CLUSTERING' | 'RANDOM_SPLIT' | 'TREE_SPLIT';

export type AudiencePartitionStatus = 'DRAFT' | 'PUBLISHED';

export interface AudiencePartitionResource {
  id: string;
  organisation_id: string;
  name?: string;
  datamart_id: string;
  part_count?: number;
  clustering_model_data_file_uri?: string;
  audience_partition_type?: AudiencePartitionType;
  status?: AudiencePartitionStatus;
  type?: string;
}
