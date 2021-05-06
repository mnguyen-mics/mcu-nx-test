import moment from 'moment';
import ApiService, { DataResponse } from './ApiService';
import { ReportViewResource } from '../models/ReportView';
import McsMoment, { formatMcsDate } from '../utils/McsMoment';

const DATE_FORMAT = 'YYYY-MM-DD';

export type ReportViewResponse = DataResponse<ReportViewResource>;

export interface Filter {
  name: string;
  value: string | number;
}

export function parseFilter(filterList?: Filter[]): string[] | undefined {
  if (filterList !== undefined && filterList.length !== 0) {
    const parsedFilters = filterList
      .filter(filter => filter !== undefined && filter.name !== '' && filter.value !== '')
      .map(
        filter => `${encodeURIComponent(filter.name)}==${encodeURIComponent(String(filter.value))}`,
      );
    return parsedFilters.length !== 0 ? parsedFilters : undefined;
  } else {
    return undefined;
  }
}

const ReportService = {
  getDisplayCampaignPerformanceReport(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/display_campaign_performance_report';
    const DEFAULT_METRICS = [
      'impressions',
      'clicks',
      'cpm',
      'ctr',
      'cpc',
      'impressions_cost' /*, 'cpa'*/,
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const parsedFilters = parseFilter(filterList);
    let params: object = {
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    if (parsedFilters !== undefined) {
      params = {
        ...params,
        filters: parsedFilters,
      };
    }
    return ApiService.getRequest(endpoint, params);
  },

  getEmailDeliveryReport(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/delivery_report';
    const DEFAULT_METRICS = [
      'email_sent',
      'email_hard_bounced',
      'email_soft_bounced',
      'clicks',
      'impressions',
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const parsedFilters = parseFilter(filterList);
    let params: object = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    if (parsedFilters !== undefined) {
      params = {
        ...params,
        filters: parsedFilters,
      };
    }
    return ApiService.getRequest(endpoint, params);
  },

  getSingleDisplayDeliveryReport(
    organisationId: string,
    campaignId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension?: string[],
    metrics?: string[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/display_campaign_performance_report';
    const DEFAULT_METRICS = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost'];
    const DEFAULT_DIMENSIONS = [''];
    const range = { from: startDate, to: endDate };

    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `campaign_id==${campaignId}`,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getAdGroupDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension?: string[],
    metrics?: string[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/ad_group_performance_report';
    const DEFAULT_DIMENSIONS = [''];
    const DEFAULT_METRICS = [
      'impressions',
      'clicks',
      'cpm',
      'ctr',
      'cpc',
      'impressions_cost' /*, 'cpa'*/,
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getAdDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension?: string[],
    metrics?: string[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/ad_performance_report';
    const DEFAULT_DIMENSIONS = [''];
    const DEFAULT_METRICS = [
      'impressions',
      'clicks',
      'cpm',
      'ctr',
      'cpc',
      'impressions_cost' /*, 'cpa'*/,
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getMediaDeliveryReport(
    organisationId: string,
    objectType: string,
    objectId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension?: string[],
    metrics?: string[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/media_performance_report';
    const DEFAULT_METRICS = [
      'impressions',
      'clicks',
      'cpm',
      'ctr',
      'cpc',
      'impressions_cost' /*, 'cpa'*/,
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const DEFAULT_DIMENSIONS = ['display_network_id', 'display_network_name', 'format'];

    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `${objectType}==${objectId}`,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getSingleEmailDeliveryReport(
    organisationId: string,
    campaignId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
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
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      filters: `campaign_id==${campaignId}`,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params).then((response: ReportViewResponse) => {
      const data = response.data.report_view.rows;
      const formattedData = [];
      for (
        const d = moment(params.start_date);
        d.diff(moment(params.end_date)) < 0;
        d.add('days', 1)
      ) {
        const dataForDay = data.find(a => {
          if (typeof a[0] === 'string') {
            // YYYY-MM-DD
            return a[0] === d.format(DATE_FORMAT);
          } else {
            // unix timestamp in millisec
            return a[0] === d.valueOf();
          }
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
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/conversion_performance_report';
    const DEFAULT_METRICS = ['conversions', 'value'];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const parsedFilters = parseFilter(filterList);
    let params: object = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    if (parsedFilters !== undefined) {
      params = {
        ...params,
        filters: parsedFilters,
      };
    }
    return ApiService.getRequest(endpoint, params);
  },

  getSingleConversionPerformanceReport(
    organisationId: string,
    goalId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/conversion_performance_report';
    const DEFAULT_METRICS = ['conversions', 'value'];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      filters: `goal_id==${goalId}`,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getAudienceSegmentReport(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
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
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const parsedFilters = parseFilter(filterList);
    let params: object = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    if (parsedFilters !== undefined) {
      params = {
        ...params,
        filters: parsedFilters,
      };
    }
    return ApiService.getRequest(endpoint, params);
  },

  getAllEmailBlastPerformance(
    organisationId: string,
    campaignId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
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
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension,
      metrics: metrics || DEFAULT_METRICS,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getConversionAttributionPerformance(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    filters: string[],
    dimension?: string[],
    metrics?: string[],
    filterList?: Filter[],
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/conversion_attribution_performance_report';
    const DEFAULT_DIMENSIONS = ['day', 'interaction_type'];
    const DEFAULT_METRICS = ['weighted_conversions', 'interaction_to_conversion_duration'];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const parsedFilters = parseFilter(filterList);
    let params: object = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
      filters,
    };
    if (parsedFilters !== undefined) {
      params = {
        ...params,
        filters: parsedFilters,
      };
    }
    return ApiService.getRequest(endpoint, params);
  },

  getVisitReport(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    filters: string[],
    dimension: string[] | undefined,
    metrics: string[] | undefined,
    options: object = {},
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/visit_report';
    const DEFAULT_DIMENSIONS = ['day'];
    const DEFAULT_METRICS = [
      'max_duration',
      'min_duration',
      'avg_duration',
      'unique_user',
      'count',
      'unique_visitor',
    ];
    const range = { from: startDate, to: endDate };
    const formattedDates = formatMcsDate(range, true);
    const params = {
      ...options,
      organisation_id: organisationId,
      start_date: formattedDates.from,
      end_date: formattedDates.to,
      dimension: dimension || DEFAULT_DIMENSIONS,
      metrics: metrics || DEFAULT_METRICS,
      filters,
    };
    return ApiService.getRequest(endpoint, params);
  },
};

export default ReportService;
