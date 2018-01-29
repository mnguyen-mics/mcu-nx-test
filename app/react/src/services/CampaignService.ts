import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse } from './ApiService';
import { CampaignResource } from '../models/campaign/CampaignResource';
import { CampaignStatus } from '../models/campaign/constants/index';

export interface GetCampaignsOptions extends PaginatedApiParam {
  administration_id?: string;
  scope?: string;
  keywords?: string[];
  status?: CampaignStatus[];
  archived?: boolean;
  label_ids?: string[];
  order_by?: string[];
}

const CampaignService = {
  getCampaigns(
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
  },
};

export default CampaignService;
