import { User } from '../../../../models/directory/UserResource';
import UserRoleResource from '../../../../models/directory/UserRoleResource';

export type UserRole = 'READER' | 'EDITOR' | 'ORGANISATION_ADMIN' | 'COMMUNITY_ADMIN';

export interface RoleOptionTitle {
  title: string;
  value: UserRole;
}

export interface UserWithRole extends User {
  role: UserRoleResource;
}
