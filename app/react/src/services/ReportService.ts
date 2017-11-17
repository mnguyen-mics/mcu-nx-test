import moment from 'moment';
import ApiService from './ApiService';
import { ReportView } from '../models';

interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

interface getExportDataProps {
  organisationId: string;
  startDate: any;
  endDate: any;
  dimension: string;
  metrics: string;
  options: object;
}

const ReportService = {
  getDisplayCampaignPerformanceReport(
    getExportDataProps
  ): CancelablePromise<ReportView> {
    const endpoint = 'reports/display_campaign_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];
    const params = {
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
};

export default ReportService;

const DATE_FORMAT = 'YYYY-MM-DD';

const getDisplayCampaignPerformanceReport = (organisationId: string,
  startDate: any,
  endDate: any,
  dimension: string,
  metrics: string,
  options: object = {}
) => {
  const endpoint = 'reports/display_campaign_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
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
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getSingleDisplayDeliveryReport = (organisationId, campaignId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/display_campaign_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost'];


  const params = {
    organisation_id: organisationId,
    filters: `campaign_id==${campaignId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getCancelableRequest(endpoint, params);
};

const getAdGroupDeliveryReport = (organisationId, objectType, objectId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/ad_group_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];


  const params = {
    organisation_id: organisationId,
    filters: `${objectType}==${objectId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getCancelableRequest(endpoint, params);
};

const getAdDeliveryReport = (organisationId, objectType, objectId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/ad_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];


  const params = {
    organisation_id: organisationId,
    filters: `${objectType}==${objectId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getCancelableRequest(endpoint, params);
};

const getMediaDeliveryReport = (organisationId, objectType, objectId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/media_performance_report';
  const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];
  const DEFAULT_DIMENSIONS = ['display_network_id', 'display_network_name'];

  const params = {
    organisation_id: organisationId,
    filters: `${objectType}==${objectId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension: dimension || DEFAULT_DIMENSIONS,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getCancelableRequest(endpoint, params);
};

const getSingleEmailDeliveryReport = (organisationId, campaignId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/delivery_report';
  const DEFAULT_METRICS = [
    'email_sent',
    'email_hard_bounced',
    'email_soft_bounced',
    'clicks',
    'impressions',
    'email_unsubscribed',
    'email_complaints',
    'uniq_impressions',
    'uniq_clicks',
    'uniq_email_sent',
    'uniq_email_unsubscribed',
    'uniq_email_hard_bounced',
    'uniq_email_soft_bounced',
    'uniq_email_complaints',
  ];

  const params = {
    organisation_id: organisationId,
    filters: `campaign_id==${campaignId}`,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
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
        params.metrics.forEach(() => {
          newDateData.push(0);
        });
        formattedData.push(newDateData);
      } else {
        formattedData.push(dataForDay);
      }
    }
    response.data.report_view.rows = formattedData; // eslint-disable-line no-param-reassign
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
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getAudienceSegmentReport = (organisationId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/audience_segment_report';
  const DEFAULT_METRICS = ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids', 'user_point_additions', 'user_point_deletions'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getAllEmailBlastPerformance = (organisationId, campaignId, startDate, endDate, dimension, metrics, options = {}) => {
  const endpoint = 'reports/delivery_report';
  const DEFAULT_METRICS = [
    'email_sent',
    'email_hard_bounced',
    'email_soft_bounced',
    'clicks',
    'impressions',
    'email_unsubscribed',
    'email_complaints',
    'uniq_impressions',
    'uniq_clicks',
    'uniq_email_sent',
    'uniq_email_unsubscribed',
    'uniq_email_hard_bounced',
    'uniq_email_soft_bounced',
    'uniq_email_complaints',
  ];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension,
    metrics: metrics || DEFAULT_METRICS,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

const getConversionAttributionPerformance = (organisationId, startDate, endDate, filters, dimension, metrics, options = {}) => {
  const endpoint = 'reports/conversion_attribution_performance_report';
  const DEFAULT_DIMENSIONS = ['day', 'interaction_type'];
  const DEFAULT_METRICS = ['weighted_conversions', 'interaction_to_conversion_duration'];

  const params = {
    organisation_id: organisationId,
    start_date: startDate.format(DATE_FORMAT),
    end_date: endDate.format(DATE_FORMAT),
    dimension: dimension || DEFAULT_DIMENSIONS,
    metrics: metrics || DEFAULT_METRICS,
    filters: filters,
    ...options,
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getDisplayCampaignPerformanceReport,
  getEmailDeliveryReport,
  getConversionPerformanceReport,
  getAudienceSegmentReport,
  getSingleEmailDeliveryReport,
  getAllEmailBlastPerformance,
  getSingleDisplayDeliveryReport,
  getAdGroupDeliveryReport,
  getAdDeliveryReport,
  getMediaDeliveryReport,
  getConversionAttributionPerformance,
};
