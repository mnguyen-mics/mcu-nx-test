import { Datamart } from './../organisation/organisation';


export interface UserWorkspaceResource {
	organisation_id: string;
  organisation_name: string;
	customer_type: string;
	administrator: boolean;
	role: string;
	datamarts: Datamart[];
}

