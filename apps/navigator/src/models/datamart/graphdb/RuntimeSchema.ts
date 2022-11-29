export interface RuntimeSchemaValidationInfoResource {
  datamart_id: string;
  schema_id: string;
  tree_index_operations: TreeIndexValidationInfoResource[];
  schema_errors: RuntimeSchemaValidationErrorRecord[];
}

export interface TreeIndexValidationInfoResource {
  datamart_id: string;
  index_selection_id: string;
  index_name: string;
  init_strategy: TreeIndexInitStrategy;
  driver_version_major_number: string;
  driver_version_minor_number: string;
  current_index_id?: string;
  current_index_size?: TreeIndexSize;
  new_index?: boolean;
  new_index_size?: TreeIndexSize;
  init_job?: TreeIndexJobType;
  error_code?: TreeIndexValidationError;
  error_message?: string;
}

export interface RuntimeSchemaValidationErrorRecord {
  error_code: RuntimeSchemaValidationError;
  error_message?: string;
}

export type TreeIndexSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type TreeIndexJobType =
  | 'CURSOR_BASED_FULL_BUILD'
  | 'INDEX_BASED_FULL_BUILD'
  | 'IN_PLACE_REFRESH';

export type TreeIndexValidationError = 'INDEX_JOB_STILL_RUNNING';

export type RuntimeSchemaValidationError = 'COMPILATION_ERROR';

export interface RuntimeSchemaPublicationInfoResource {
  datamart_id: string;
  schema_id: string;
  tree_indices: TreeIndexPublicationInfoResource[];
}

export interface TreeIndexPublicationInfoResource {
  index_name: string;
  new_index: boolean;
  index_id: string;
  index_size: TreeIndexSize;
  init_strategy: TreeIndexInitStrategy;
  driver_version_major_number: string;
  driver_version_minor_number: string;
  init_job?: TreeIndexJobType;
}

export interface RuntimeSchemaPublicationErrorRecord {
  error_code: RuntimeSchemaValidationError;
  error_message?: string;
}

export type TreeIndexInitStrategy =
  | 'AUTOMATIC'
  | 'FORCE_BUILD_FROM_CURSOR'
  | 'FORCE_BUILD_FROM_INDEX'
  | 'FORCE_NO_BUILD'
  | 'MANUAL';

export interface RuntimeSchemaResource {
  id: string;
  datamart_id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ARCHIVED';
  creation_date: number;
  modification_date: number;
  publication_date: number;
}

export type ObjectLikeType = 'OBJECT_TYPE' | 'INTERFACE_TYPE';
export interface ObjectLikeTypeResource {
  id: string;
  runtime_schema_id: string;
  type: ObjectLikeType;
  name: string;
}

export interface ObjectLikeTypeDirectiveResource {
  id: string;
  type: ObjectLikeType;
  name: string;
}

export interface DirectiveArgumentResource {
  id: string;
  directiveId: string;
  name: string;
  value: string;
}

export interface ObjectLikeTypeDirectiveInfoResource extends ObjectLikeTypeDirectiveResource {
  arguments: DirectiveArgumentResource[];
}

export interface FieldResource {
  id: string;
  object_like_type_id: string;
  runtime_schema_id: string;
  field_type: GTypes | GTypesNonMandatory | string;
  name: string;
}

export interface FieldDirectiveResource {
  id: string;
  field_id: string;
  object_like_type_id: string;
  runtime_schema_id: string;
  name: string;
  comment: string;
  arguments?: DirectiveArgumentResource[];
}

export interface FieldDirectiveInfoResource extends FieldDirectiveResource {
  arguments: DirectiveArgumentResource[];
}

export type SchemaDecoratorResource =
  | SchemaVisibleDecoratorResource
  | SchemaHiddenDecoratorResource;

export interface SchemaBaseDecoratorResource {
  id: string;
  hidden: boolean;
  object_name: string;
  field_name: string;
  language: string;
  schema_id: string;
  datamart_id: string;
  label: string;
  help_text?: string;
  locale?: string;
}

export interface SchemaVisibleDecoratorResource extends SchemaBaseDecoratorResource {
  hidden: false;
}

export interface SchemaHiddenDecoratorResource extends SchemaBaseDecoratorResource {
  hidden: true;
}

export interface FieldInfoResource extends FieldResource {
  directives: FieldDirectiveInfoResource[];
  decorator?: SchemaDecoratorResource;
}

export interface ObjectLikeTypeInfoResource extends ObjectLikeTypeResource {
  fields: FieldInfoResource[];
  directives: ObjectLikeTypeDirectiveInfoResource[];
}

// see https://github.com/MEDIARITHMICS/mediarithmics-platform/blob/d741c845e5dd5850b17770295758e577d0bd8788/graphdb/graphdb-engine-lib/src/main/scala/com/mediarithmics/graphdb/datamart/schema/package.scala#L95
export type BuitinEnumerationType =
  | 'HashFunction'
  | 'FormFactor'
  | 'BrowserFamily'
  | 'OperatingSystemFamily'
  | 'UserAgentType'
  | 'ActivitySource'
  | 'UserActivityType';

export type ActivitySource =
  | 'PIXEL_TRACKING'
  | 'API'
  | 'INTERNAL'
  | 'SESSION_AGGREGATOR'
  | 'ACTIVITY_STORE';

export type UserActivityType =
  | 'ALL'
  | 'USER_PLATFORM'
  | 'TOUCH'
  | 'SITE_VISIT'
  | 'APP_VISIT'
  | 'EMAIL'
  | 'DISPLAY_AD'
  | 'STOPWATCH'
  | 'STAGING_AREA'
  | 'RECOMMENDER'
  | 'USER_SCENARIO_START'
  | 'USER_SCENARIO_STOP'
  | 'USER_SCENARIO_NODE_ENTER'
  | 'USER_SCENARIO_NODE_EXIT';

export type OperatingSystemFamily = 'OTHER' | 'WINDOWS' | 'MAC_OS' | 'LINUX' | 'ANDROID' | 'IOS';

export type HashFunction = 'MD2' | 'MD5' | 'SHA_1' | 'SHA_256' | 'SHA_384' | 'SHA_512' | 'NO_HASH';

export type FormFactor =
  | 'OTHER'
  | 'PERSONAL_COMPUTER'
  | 'SMART_TV'
  | 'GAME_CONSOLE'
  | 'SMARTPHONE'
  | 'TABLET'
  | 'WEARABLE_COMPUTER';

export type BrowserFamily =
  | 'OTHER'
  | 'CHROME'
  | 'IE'
  | 'FIREFOX'
  | 'SAFARI'
  | 'OPERA'
  | 'STOCK_ANDROID'
  | 'BOT'
  | 'EMAIL_CLIENT'
  | 'MICROSOFT_EDGE';

export type UserAgentType = 'WEB_BROWSER' | 'MOBILE_APP';

type GTypes =
  | 'Bool'
  | 'Timestamp'
  | 'Date'
  | 'ID'
  | 'String'
  | 'Number'
  | 'Enum'
  | 'Null'
  | 'List'
  | 'Option'
  | 'Map'
  | 'Bean';
type GTypesNonMandatory =
  | 'Bool!'
  | 'Timestamp!'
  | 'Date!'
  | 'ID!'
  | 'String!'
  | 'Number!'
  | 'Enum!'
  | 'Null!'
  | 'List!'
  | 'Option!'
  | 'Map!'
  | 'Bean!';
