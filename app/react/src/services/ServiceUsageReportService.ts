import { ReportViewResponse, parseFilter, Filter } from './ReportService';
import ApiService from './ApiService';
import McsMoment, { formatMcsDate } from '../utils/McsMoment';

const ServiceUsageReportService = {
  getServiceUsageProviders(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/service_usage_provider_report';
    const DEFAULT_METRICS = [
      'campaign_id',
      'campaign_name',
      'provider_name',
      'service_id',
      'service_name',
      'service_element_id',
      'service_element_name',
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
};

export default ServiceUsageReportService;
