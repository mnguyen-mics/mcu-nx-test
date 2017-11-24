export interface AudienceSegmentResource {
    id: string;
    name: string;
}

export interface AudienceSegmentSelectionResource {
    id?: string;
    audience_segment_id: string;
    exclude: boolean;
}
