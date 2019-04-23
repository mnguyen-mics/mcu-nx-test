import { DatamartWithMetricResource } from '../datamart/DatamartResource';

export interface UserWorkspaceResource {
  organisation_id: string;
  organisation_name: string;
  customer_type: string;
  administrator: boolean;
  role: string;
  datamarts: DatamartWithMetricResource[];
}

export interface UserProfileResource {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  locale: string;
  workspaces: UserWorkspaceResource[];
  default_workspace: number;
}
