import { BudgetPeriod, CampaignStatus, DisplayCampaignSubType, ModelVersion } from '../constants';

export interface DisplayCampaignResource extends DisplayCampaignCreateRequest {
  id: string;
  status: CampaignStatus;
  archived: boolean;
}

export interface DisplayCampaignCreateRequest {
  organisation_id: string;
  name: string;
  creation_ts: number;
  editor_version_id: string;
  editor_version_value: string;
  editor_group_id: string;
  editor_artifact_id: string;
  currency_code: string;
  technical_name: string;
  subtype: DisplayCampaignSubType;
  max_bid_price: number;
  total_budget: number;
  max_budget_per_period: number;
  max_budget_period: BudgetPeriod;
  total_impression_capping: number;
  per_day_impression_capping: number;
  start_date: string;
  end_date: string;
  time_zone: string;
  model_version: ModelVersion;
  type: string;
  automated: boolean;
}

export interface DisplayCampaignResourceWithStats extends DisplayCampaignResource {
  clicks?: number;
  cpc?: number;
  cpm?: number;
  ctr?: number;
  impressions?: number;
  impressions_cost?: number;
}
