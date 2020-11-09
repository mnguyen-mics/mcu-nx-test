export interface DealDescriptorResource
  extends DealDescriptorCreateRequest {
  id: string;
}

export interface DealDescriptorCreateRequest {
  descriptor_type: string;
  value: string;
  keywords: string[];
  placement_holder: string;
}
