export interface PluginLayout {
  version: string,
  sections: PluginLayoutSectionResource[]
}

export interface PluginLayoutSectionResource {
  title: string,
  sub_title: string,
  fields: PluginLayoutFieldResource[]
}

export interface PluginLayoutFieldResource {
  property_technical_name: string,
  field_type : PluginLayoutField,
  label: string,
  tooltip?: string,
  enum?: PluginLayoutEnumResource[],
  max_length?: number
}

export type PluginLayoutField =
  'TEXTAREA' |
  'URL' |
  'DATA_FILE' |
  'HTML' |
  'NUMBER' |
  'SELECT' |
  'MULTI_SELECT' |
  'IMAGE';

export interface PluginLayoutEnumResource {
  value: string,
  label: string
}
