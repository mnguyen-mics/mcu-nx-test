export interface RuntimeSchemaResource {
  id: string;
  datamart_id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE'| 'ARCHIVED';
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
}

export interface FieldDirectiveInfoResource extends FieldDirectiveResource {
  arguments: DirectiveArgumentResource[];
}

export interface FieldInfoResource extends FieldResource {
  directives: FieldDirectiveInfoResource[];
}

export interface ObjectLikeTypeInfoResource extends ObjectLikeTypeResource {
  fields: FieldInfoResource[],
  directives: ObjectLikeTypeDirectiveInfoResource[];
}

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