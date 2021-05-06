export interface PluginLayout {
  version: string;
  sections: PluginLayoutSectionResource[];
  metadata: PluginLayoutMetadataResource;
}

export interface PluginLayoutSectionResource {
  title: string;
  sub_title: string;
  fields: PluginLayoutFieldResource[];
  advanced_fields: PluginLayoutFieldResource[];
}

export interface PluginLayoutFieldResource {
  property_technical_name: string;
  field_type: PluginLayoutField;
  label: string;
  tooltip?: string;
  enum?: PluginLayoutEnumResource[];
  max_length?: number;
  required?: boolean;
}

export type PluginLayoutField =
  | 'TEXTAREA'
  | 'URL'
  | 'DATA_FILE'
  | 'HTML'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'IMAGE'
  | 'INPUT'
  | 'INPUT_NUMBER'
  | 'SWITCH'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DATE'
  | 'DATE_RANGE';

export interface PluginLayoutEnumResource {
  value: string;
  label: string;
}

export interface PluginLayoutMetadataResource {
  large_icon_asset_id: string;
  small_icon_asset_id: string;
  large_icon_asset_url?: string;
  small_icon_asset_url?: string;
  display_name: string;
  description: string;
}
