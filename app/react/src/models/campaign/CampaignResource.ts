import { CampaignStatus } from './constants';

export interface CampaignResource {
  id: string;
  organisation_id: string;
  name: string;
  creation_ts: number;
  editor_version_id: string;
  editor_version_value: string;
  editor_group_id: string;
  editor_artifact_id: string;
  status: CampaignStatus;
  currency_code: string;
  technical_name: string;
  archived: boolean;
  automated: boolean;
  type: string;
}

export interface CampaignRouteParams {
  organisationId: string;
  campaignId: string;
}
