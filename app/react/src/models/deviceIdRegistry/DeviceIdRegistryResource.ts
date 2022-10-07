export type DeviceIdRegistryType =
  | 'INSTALLATION_ID'
  | 'MUM_ID'
  | 'NETWORK_DEVICE_ID'
  | 'CUSTOM_DEVICE_ID'
  | 'MOBILE_ADVERTISING_ID'
  | 'MOBILE_VENDOR_ID';

export interface DeviceIdRegistryResource {
  id: string;
  name: string;
  description?: string;
  type: DeviceIdRegistryType;
  organisation_id: string;
}

export interface DeviceIdRegistryOfferResource {
  id: string;
  device_id_registry_type: DeviceIdRegistryType;
  name: string;
  subscribed: boolean;
}

export interface DeviceIdRegistryDatamartSelectionResource {
  id: string;
  device_id_registry_id: string;
  datamart_id: string;
}
