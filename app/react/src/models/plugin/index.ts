import { UploadFile } from 'antd/lib/upload/interface';

export type PluginPropertyOrigin = 'PLUGIN_STATIC' | 'PLUGIN' | 'INSTANCE';

export type PluginPropertyType =
  | 'STRING'
  | 'URL'
  | 'DOUBLE'
  | 'INT'
  | 'BOOLEAN'
  | 'ASSET'
  | 'ASSET_FILE'
  | 'DATA_FILE'
  | 'AD_LAYOUT'
  | 'STYLE_SHEET'
  | 'PIXEL_TAG'
  | 'RECOMMENDER'
  | 'LONG'
  | 'MODEL_ID'
  | 'DATAMART_ID'
  | 'RECOMMENDER_ID'
  | 'NATIVE_IMAGE'
  | 'NATIVE_TITLE'
  | 'NATIVE_DATA';

export interface PropertyResource {
  deletable: boolean;
  origin: PluginPropertyOrigin;
  technical_name: string;
  writable: boolean;
  property_type: PluginPropertyType;
}

export type PropertyResourceShape =
  | StringPropertyResource
  | UrlPropertyResource
  | DoublePropertyResource
  | IntPropertyResource
  | BooleanPropertyResource
  | AssetPropertyResource
  | AssetFilePropertyResource
  | AssetPropertyCreationResource
  | DataFilePropertyResource
  | AdLayoutPropertyResource
  | StyleSheetPropertyResource
  | PixelTagPropertyResource
  | RecommenderPropertyResource
  | LongPropertyResource
  | ModelIdPropertyResource
  | DatamartIdPropertyResource
  | RecommenderIdPropertyResource
  | NativeImagePropertyResource
  | NativeTitlePropertyResource
  | NativeDataPropertyResource;

export interface StringPropertyResource extends PropertyResource {
  property_type: 'STRING';
  value: { value: string };
}

export interface UrlPropertyResource extends PropertyResource {
  property_type: 'URL';
  value: { url: string };
}

export interface DoublePropertyResource extends PropertyResource {
  property_type: 'DOUBLE';
  value: { value: number };
}

export interface IntPropertyResource extends PropertyResource {
  property_type: 'INT';
  value: { value: number };
}

export interface BooleanPropertyResource extends PropertyResource {
  property_type: 'BOOLEAN';
  value: { value: boolean };
}

export interface AssetPropertyResource extends PropertyResource {
  property_type: 'ASSET';
  value: { value: any };
}

export interface AssetFilePropertyResource extends PropertyResource {
  property_type: 'ASSET_FILE';
  value: { value: any };
}

export interface AssetPropertyCreationResource extends PropertyResource {
  property_type: 'ASSET';
  value: { file: UploadFile };
}

export interface DataFilePropertyResource extends PropertyResource {
  property_type: 'DATA_FILE';
  value: { value: any };
}

export interface AdLayoutPropertyResource extends PropertyResource {
  property_type: 'AD_LAYOUT';
  value: { value: any };
}

export interface StyleSheetPropertyResource extends PropertyResource {
  property_type: 'STYLE_SHEET';
  value: { value: any };
}

export interface PixelTagPropertyResource extends PropertyResource {
  property_type: 'PIXEL_TAG';
  value: { value: any };
}

export interface RecommenderPropertyResource extends PropertyResource {
  property_type: 'RECOMMENDER';
  value: { value: any };
}

export interface LongPropertyResource extends PropertyResource {
  property_type: 'LONG';
  value: { value: any };
}

export interface ModelIdPropertyResource extends PropertyResource {
  property_type: 'MODEL_ID';
  value: { value: any };
}

export interface DatamartIdPropertyResource extends PropertyResource {
  property_type: 'DATAMART_ID';
  value: { value: any };
}

export interface RecommenderIdPropertyResource extends PropertyResource {
  property_type: 'RECOMMENDER_ID';
  value: { value: any };
}

export interface NativeImagePropertyResource extends PropertyResource {
  property_type: 'NATIVE_IMAGE';
  value: { value: any };
}

export interface NativeTitlePropertyResource extends PropertyResource {
  property_type: 'NATIVE_TITLE';
  value: { value: any };
}

export interface NativeDataPropertyResource extends PropertyResource {
  property_type: 'NATIVE_DATA';
  value: { value: any };
}
