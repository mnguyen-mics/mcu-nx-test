export type Index<T> = { [key: string]: T };

export interface OrganisationIdProp {
  organisationId: string;
}

export function getOrElse<T>(t: T | undefined, _default: T): T {
  return t ? t : _default;
}
