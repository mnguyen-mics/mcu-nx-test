export type AudienceFeatureType = AudienceFeatureCommonType | 'Interval';

type AudienceFeatureCommonType = 'Int' | 'Enum' | 'Boolean' | 'String' | 'Date';

interface AudienceFeatureCommonResource {
  path: string[];
  directives?: any[];
}

export interface AudienceFeatureVariable<T>
  extends AudienceFeatureCommonResource {
  type: T;
  name: string;
}

export interface AudienceFeatureIntervalVariable
  extends AudienceFeatureCommonResource {
  type: 'Interval';
  from: string;
  to: string;
}

export type AudienceFeatureVariableShape =
  | AudienceFeatureVariable<AudienceFeatureCommonType>
  | AudienceFeatureIntervalVariable;

export interface AudienceFeatureResource {
  id: string;
  name: string;
  description: string;
  token: string;
  addressable_object: string;
  object_tree_expression: string;
  variables: AudienceFeatureVariableShape[];
}

export function isAudienceFeatureIntervalVariable(
  variable: AudienceFeatureVariableShape,
): variable is AudienceFeatureIntervalVariable {
  return variable.type === 'Interval';
}
