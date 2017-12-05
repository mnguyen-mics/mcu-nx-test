import { DataResponse } from './../../../services/ApiService';
import {
  AdSlotVisibilityFilter,
  AdGroupStatus,
  BidOptimizationObjectiveType,
  BudgetPeriod,
 } from './../constants/';

export interface AdGroupResource {
  id: string;
  name: string;
  status: AdGroupStatus;
  technical_name: string;
  visibility: AdSlotVisibilityFilter;
  bid_optimizer_id: string;
  bid_optimization_objective_type: BidOptimizationObjectiveType;
  bid_optimization_use_user_data: boolean;
  bid_optimization_objective_value: string;
  viewability_min_score: number | null;
  viewability_use_third_party_data: boolean;
  ab_selection: boolean;
  ab_selection_min: number;
  ab_selection_max: number;
  start_date: string | null;
  end_date: string | null;
  max_bid_price: number;
  per_day_impression_capping: number;
  total_impression_capping: number;
  budget_relative_to_campaign: boolean;
  total_budget: number;
  max_budget_per_period: number | null;
  max_budget_period: BudgetPeriod | null;
}

export type AdGroupResponse = DataResponse<AdGroupResource>;
export type AdGroupResponseList = AdGroupResponse[];
