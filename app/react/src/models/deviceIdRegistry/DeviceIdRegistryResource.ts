export enum DeviceIdRegistryType {
  INSTALLATION_ID = 'INSTALLATION_ID',
  MUM_ID = 'MUM_ID',
  NETWORK_DEVICE_ID = 'NETWORK_DEVICE_ID',
  CUSTOM_DEVICE_ID = 'CUSTOM_DEVICE_ID',
  MOBILE_ADVERTISING_ID = 'MOBILE_ADVERTISING_ID',
  MOBILE_VENDOR_ID = 'MOBILE_VENDOR_ID',
}

export interface DeviceIdRegistryResource {
  id: string;
  name: string;
  description?: string;
  type: DeviceIdRegistryType;
  organisation_id: string;
  image_uri?: string;
}

export interface DeviceIdRegistryOfferResource {
  id: string;
  name: string;
  device_id_registries: DeviceIdRegistryResource[];
  agreement_id?: string;
}

export interface DeviceIdRegistryDatamartSelectionResource {
  id: string;
  device_id_registry_id: string;
  datamart_id: string;
}
