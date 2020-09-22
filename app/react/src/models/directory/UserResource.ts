import UserRoleResource from './UserRoleResource';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  locale: string;
  organisation_id: string;
  community_id: string;
}

export interface UserCreationWithRoleResource extends User {
  role?: string;
}
export default interface UserResource extends User {
  user_roles?: UserRoleResource[];
}