export interface AudienceSegmentSelectionResource extends AudienceSegmentSelectionCreateRequest {
  id: string;
  technical_name?: string;
  name: string;
}

export interface AudienceSegmentSelectionCreateRequest {
  audience_segment_id: string;
  exclude: boolean;
}
