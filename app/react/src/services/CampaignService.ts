import ApiService, { DataListResponse } from './ApiService';
import { CampaignResource } from '../models/campaign/CampaignResource';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { CampaignStatus } from '../models/campaign/constants/index';

interface GetCampaignsOptions extends PaginatedApiParam {
  administration_id?: string;
  scope?: string;
  keywords?: string[];
  status?: CampaignStatus[];
  archived?: boolean;
  label_ids?: string[];
  order_by?: string[];
}

function getCampaigns(
  organisationId: string,
  campaignType: 'DISPLAY' | 'EMAIL',
  options: GetCampaignsOptions = {},
): Promise<DataListResponse<CampaignResource>> {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
}

export default {
  getCampaigns,
};
