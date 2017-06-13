import moment from 'moment';
import ApiService from './ApiService';


const DATE_FORMAT = 'YYYY-MM-DD';

const getDisplayCampaignPerformanceReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
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

const getSingleEmailDeliveryReport = (organisationId, campaignId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/delivery_report';
  const DEFAULT_METRICS = ['email_sent', 'email_hard_bounced', 'email_soft_bounced', 'clicks', 'impressions', 'email_unsubscribed', 'email_complaints', 'uniq_impressions', 'uniq_clicks', 'uniq_email_sent', 'uniq_email_unsubscribed', 'uniq_email_hard_bounced', 'uniq_email_soft_bounced', 'uniq_email_complaints'];

  const params = {
    organisation_id: organisationId,
    filters: `campaign_id==${campaignId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options
  };

  return ApiService.getRequest(endpoint, params).then(response => {
    const data = response.data.report_view.rows;
    const formattedData = [];
    for (const d = moment(params.start_date); d.diff(moment(params.end_date)) < 0; d.add('days', 1)) {
      const dataForDay = data.find(a => {
        return a[0] === d.format(DATE_FORMAT);
      });
      if (!dataForDay) {
        const newDateData = [];
        newDateData.push(d.format(DATE_FORMAT));
        params.metrics.forEach(f => {
          newDateData.push(0);
        });
        formattedData.push(newDateData);
      } else {
        formattedData.push(dataForDay);
      }
    }
    response.data.report_view.rows = formattedData;
    return response;
  });
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

const getAllEmailBlastPerformance = (organisationId, campaignId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/delivery_report';
  const DEFAULT_METRICS = ['email_sent', 'email_hard_bounced', 'email_soft_bounced', 'clicks', 'impressions', 'email_unsubscribed', 'email_complaints', 'uniq_impressions', 'uniq_clicks', 'uniq_email_sent', 'uniq_email_unsubscribed', 'uniq_email_hard_bounced', 'uniq_email_soft_bounced', 'uniq_email_complaints'];

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
  getDisplayCampaignPerformanceReport,
  getEmailDeliveryReport,
  getConversionPerformanceReport,
  getAudienceSegmentReport,
  getSingleEmailDeliveryReport,
  getAllEmailBlastPerformance
};
