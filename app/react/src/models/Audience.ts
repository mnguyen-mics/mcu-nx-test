export interface AudienceSegmentResource {
    id: string;
    name: string;
}

export interface AudienceSegmentSelectionResource {
    id?: string;
    audienceSegmentId: string;
    exclude: boolean;
}
