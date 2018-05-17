export type AttributionSelectionType = 'DIRECT' | 'WITH_PROCESSOR';

export type AttributionModelMode = 'STRICT' | 'DISCOVERY';

export interface AttributionSelectionCreateRequest {
  attribution_type: AttributionSelectionType;
  attribution_model_id?: string;
  default: boolean;
}

export interface AttributionSelectionResource
  extends AttributionSelectionCreateRequest {
  id: string;
  attribution_model_mode: AttributionModelMode;
  attribution_model_name: string;
  attribution_model_id: string;
  group_id: string;
  artifact_id: string;
}

export interface AttributionModelCreateRequest {
  name: string;
  group_id: string;
  artifact_id: string;
  mode?: AttributionModelMode;
}

export interface AttributionModelResource
  extends AttributionModelCreateRequest {
  id: string;
  organisation_id: string;
  attribution_processor_id: string;
}
