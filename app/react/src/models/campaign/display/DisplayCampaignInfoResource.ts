import { AdResource } from './AdResource';
import { AdGroupResource } from './AdGroupResource';
import { CampaignStatus, DisplayCampaignSubType, CreativeAuditStatus } from './../constants';
import { InventorySourceResource } from './InventorySourceResource';
import { GoalSelectionResource } from './../../goal/GoalSelectionResource';

export interface DisplayCampaignInfoResource {
  id: string;
  technical_name: string;
  organisation_id: string;
  organisation_name: string;
  administrator_id: string;
  name: string;
  status: CampaignStatus;
  subtype: DisplayCampaignSubType;
  currency_code: string;
  time_zone: string;
  max_bid_price: number;
  model_version: string;
  total_budget: number;
  max_daily_budget: number;
  total_impression_capping: number;
  per_day_impression_capping: number;
  editor_version_id: string;
  ad_groups: AdGroupInfoResource[];
  inventory_sources: InventorySourceResource[];
  start_date: string;
  end_date: string;
  goal_selections: GoalSelectionResource[];
}

export interface AdGroupInfoResource extends AdGroupResource {
  ads: AdInfoResource[];
  audience_segments: AudienceSegmentSelectionInfoResource[];
}

export interface AdInfoResource extends AdResource {
  name: string;
  format: string;
  creative_audit_status: CreativeAuditStatus;
  creative_editor_group_id: string;
  creative_editor_artifact_id: string;
  creative_renderer_group_id: string;
  creative_renderer_artifact_id: string;
  creative_technical_name: string;
  ad_group_id: string;
}

export interface AudienceSegmentSelectionInfoResource {
  id: string;
  technical_name: string;
  audience_segment_id: string;
  datamart_id: string;
  exclude: boolean;
}
