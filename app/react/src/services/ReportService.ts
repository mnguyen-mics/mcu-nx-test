import moment from 'moment';
import ApiService, { DataResponse } from './ApiService';
import { ReportViewResource } from '../models/ReportView';

const DATE_FORMAT = 'YYYY-MM-DD';

type ReportViewResponse = DataResponse<ReportViewResource>;

const ReportService = {
  getDisplayCampaignPerformanceReport(
    organisationId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/display_campaign_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getEmailDeliveryReport(
    organisationId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/delivery_report';
    const DEFAULT_METRICS = ['email_sent', 'email_hard_bounced', 'email_soft_bounced', 'clicks', 'impressions'];
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getSingleDisplayDeliveryReport(
    organisationId: string,
    campaignId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/display_campaign_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost'];

    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `campaign_id==${campaignId}`,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
   };
    return ApiService.getRequest(endpoint, params);
  },

  getAdGroupDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/ad_group_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getAdDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/ad_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];

    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getMediaDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/media_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa'];
    const DEFAULT_DIMENSIONS = ['display_network_id', 'display_network_name'];

    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getSingleEmailDeliveryReport(
    organisationId: string,
    campaignId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
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
      ...options,
      organisation_id: organisationId,
      filters: `campaign_id==${campaignId}`,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params).then((response: ReportViewResponse) => {
      const data = response.data.report_view.rows;
      const formattedData = [];
      for (const d = moment(params.start_date); d.diff(moment(params.end_date)) < 0; d.add('days', 1)) {
        const dataForDay = data.find(a => {
          return a[0] === d.format(DATE_FORMAT);
        });
        if (!dataForDay) {
          const newDateData: Array<string | number> = [];
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
  },

  getConversionPerformanceReport(
    organisationId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/conversion_performance_report';
    const DEFAULT_METRICS = ['conversions', 'value'];

    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getAudienceSegmentReport(
    organisationId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/audience_segment_report';
    const DEFAULT_METRICS = [
      'user_points',
      'user_accounts',
      'emails',
      'desktop_cookie_ids',
      'user_point_additions',
      'user_point_deletions',
    ];

    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getAllEmailBlastPerformance(
    organisationId: string,
    campaignId: number,
    startDate: moment.Moment,
    endDate: moment.Moment,
    dimension: string[],
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
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
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getConversionAttributionPerformance(
    organisationId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    filters: string[],
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/conversion_attribution_performance_report';
    const DEFAULT_DIMENSIONS = ['day', 'interaction_type'];
    const DEFAULT_METRICS = ['weighted_conversions', 'interaction_to_conversion_duration'];
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: startDate.format(DATE_FORMAT),
      end_date: endDate.format(DATE_FORMAT),
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
      filters,
    };
    return ApiService.getRequest(endpoint, params);
  },
};

export default ReportService;
