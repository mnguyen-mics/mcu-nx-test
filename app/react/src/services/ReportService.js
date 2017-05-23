import ApiService from './ApiService';

const DATE_FORMAT = 'YYYY-MM-DD';

const getDisplayCampaignPerfomanceReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/display_campaign_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getEmailDeliveryReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/delivery_report';
  const DEFAULT_METRICS = ['email_sent', 'email_hard_bounced', 'email_soft_bounced', 'clicks', 'impressions'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getConversionPerformanceReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/conversion_performance_report';
  const DEFAULT_METRICS = ['conversions', 'value'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

const getAudienceSegmentReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/audience_segment_report';
  const DEFAULT_METRICS = ['user_points', 'user_accounts', 'emails,desktop_cookie_ids', 'user_point_additions', 'user_point_deletions'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getDisplayCampaignPerfomanceReport,
  getEmailDeliveryReport,
  getConversionPerformanceReport,
  getAudienceSegmentReport
};
