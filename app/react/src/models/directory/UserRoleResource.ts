export default interface UserRoleResource {
  id?: string;
  role: string;
  creation_date?: string;
  organisation_id: string;
  // Properties used for frontend purpose only
  is_inherited?: boolean;
  is_home_user?: boolean;
}
