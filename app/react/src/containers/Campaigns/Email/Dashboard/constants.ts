import { DATE_SEARCH_SETTINGS, DateSearchSettings } from '../../../../utils/LocationSearchHelper';

export const EMAIL_DASHBOARD_SEARCH_SETTINGS = [...DATE_SEARCH_SETTINGS];

export interface EmailCampaignDashboardRouteMatchParam {
  organisationId: string;
  campaignId: string;
}

export interface EmailDashboardSearchSettings extends DateSearchSettings {}
