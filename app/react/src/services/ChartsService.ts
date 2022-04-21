import { injectable } from 'inversify';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { ApiService } from '@mediarithmics-private/advanced-components';
import { ChartResource } from '../models/chart/Chart';

export interface IChartService {
  getCharts: (organisationId: string, filters?: object) => Promise<DataListResponse<ChartResource>>;

  getChart: (chartId: string, organisationId: string) => Promise<DataResponse<ChartResource>>;

  createChart: (
    organisationId: string,
    resource: Partial<ChartResource>,
  ) => Promise<DataResponse<ChartResource>>;

  updateChart: (
    chartId: string,
    organisationId: string,
    resource: Partial<ChartResource>,
  ) => Promise<DataResponse<ChartResource>>;

  deleteChart: (chartId: string, organisationId: string) => Promise<void>;
}

@injectable()
export default class ChartService implements IChartService {
  async deleteChart(chartId: string, organisationId: string): Promise<void> {
    const endpoint = `charts/${chartId}`;
    const options = {
      organisation_id: organisationId,
    };
    return ApiService.deleteRequest<void>(endpoint, options);
  }

  getCharts(
    organisationId: string,
    filters: object = {},
  ): Promise<DataListResponse<ChartResource>> {
    const endpoint = `charts`;

    const options = {
      ...filters,
      organisation_id: organisationId,
    };
    return ApiService.getRequest<DataListResponse<ChartResource>>(endpoint, options);
  }

  getChart(chartId: string, organisationId: string): Promise<DataResponse<ChartResource>> {
    const endpoint = `charts/${chartId}`;

    const options = {
      organisation_id: organisationId,
    };

    return ApiService.getRequest<DataResponse<ChartResource>>(endpoint, options);
  }

  createChart(
    organisationId: string,
    resource: Partial<ChartResource>,
  ): Promise<DataResponse<ChartResource>> {
    const endpoint = `charts`;
    const body = {
      ...resource,
      organisation_id: organisationId,
    };
    return ApiService.postRequest<DataResponse<ChartResource>>(endpoint, body);
  }

  updateChart(
    chartId: string,
    organisationId: string,
    resource: Partial<ChartResource>,
  ): Promise<DataResponse<ChartResource>> {
    const endpoint = `charts/${chartId}`;
    const body = {
      ...resource,
      organisation_id: organisationId,
    };

    return ApiService.putRequest<DataResponse<ChartResource>>(endpoint, body);
  }
}
