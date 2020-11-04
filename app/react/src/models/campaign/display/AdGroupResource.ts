import {
  AdSlotVisibilityFilter,
  AdGroupStatus,
  BudgetPeriod,
  TargetedOperatingSystem,
  TargetedDevice,
  TargetedMedia,
  TargetedBrowserFamily,
  TargetedConnectionType
} from '../constants';

export interface AdGroupCreateRequest {
  name: string;
  technical_name: string;
  visibility: AdSlotVisibilityFilter;
  viewability_min_score: number | null;
  viewability_use_third_party_data: boolean;
  ab_selection: boolean;
  ab_selection_min: number;
  ab_selection_max: number;
  start_date: number | null;
  end_date: number | null;
  max_bid_price: number;
  per_day_impression_capping: number;
  total_impression_capping: number;
  budget_relative_to_campaign: boolean;
  total_budget: number;
  max_budget_per_period: number | null;
  max_budget_period: BudgetPeriod;
  status: AdGroupStatus;
  targeted_operating_systems: TargetedOperatingSystem;
  targeted_medias: TargetedMedia;
  targeted_devices: TargetedDevice;
  targeted_browser_families: TargetedBrowserFamily;
  targeted_connection_types: TargetedConnectionType;
}

export interface AdGroupResource extends AdGroupCreateRequest {
  id: string;
}
