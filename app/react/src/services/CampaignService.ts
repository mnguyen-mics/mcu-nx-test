import ApiService, { DataListResponse } from './ApiService';
import { CampaignResource } from '../models/campaign/CampaignResource';

function getCampaigns(organisationId: string, campaignType: 'DISPLAY' | 'EMAIL'): Promise<DataListResponse<CampaignResource>> {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
  };

  return ApiService.getRequest(endpoint, params);
}

export default {
  getCampaigns,
};
