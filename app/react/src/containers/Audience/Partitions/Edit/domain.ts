import { AudiencePartitionType } from '../../../../models/audiencePartition/AudiencePartitionResource';

export interface AudiencePartitionFormData {
    name?: string;
    type?: AudiencePartitionType;
    part_count?: number;
    clustering_model_data_file_uri?: string;
} 

export const INITIAL_AUDIENCE_PARTITION_FORM_DATA: AudiencePartitionFormData = {
    name: '',
    clustering_model_data_file_uri: '',
}