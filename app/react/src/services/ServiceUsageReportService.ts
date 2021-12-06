import { ReportViewResponse, parseFilter, Filter } from './ReportService';
import { ApiService } from '@mediarithmics-private/advanced-components';
import McsMoment, { formatMcsDate } from '../utils/McsMoment';
import { injectable } from 'inversify';

export interface IServiceUsageReportService {
  getServiceUsageProviders: (
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class ServiceUsageReportService implements IServiceUsageReportService {
  getServiceUsageProviders(
    organisationId: string,
    startDate: McsMoment,
    endDate: McsMoment,
    dimension: string[],
    metrics?: string[],
    filterList?: Filter[],
  ): Promise<ReportViewResponse> {
    const endpoint = 'reports/service_usage_provider_report';
    const DEFAULT_METRICS = ['unit_count'];
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
  }
}
