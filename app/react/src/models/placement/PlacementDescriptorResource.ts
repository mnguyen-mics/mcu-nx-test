export interface PlacementDescriptorResource
  extends PlacementDescriptorCreateRequest {
  id: string;
}

export interface PlacementDescriptorCreateRequest {
  descriptor_type: string;
  value: string;
  keywords: string[];
  placement_holder: string;
}
