import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import PluginService from '../PluginService';
import { VisitAnalyzer, PluginProperty } from '../../models/Plugins';
import { PropertyResourceShape } from '../../models/plugin';

const visitAnalyzerService = {
  getVisitAnalyzers(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<VisitAnalyzer>> {
    const endpoint = 'visit_analyzer_models';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  deleteVisitAnalyzerProperty(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `visit_analyzer_models/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  },
  getVisitAnalyzerProperty(
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `visit_analyzer_models/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  },
  getVisitAnalyzer(
    id: string,
    options: object = {},
  ): Promise<DataResponse<VisitAnalyzer>> {
    const endpoint = `visit_analyzer_models/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  createVisitAnalyzer(
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<VisitAnalyzer>> {
    const endpoint = `visit_analyzer_models?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  },
  updateVisitAnalyzer(
    id: string,
    options: object = {},
  ): Promise<DataResponse<VisitAnalyzer>> {
    const endpoint = `visit_analyzer_models/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  },
  updateVisitAnalyzerProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PluginProperty> | void> {
    const endpoint = `visit_analyzer_models/${id}/properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(
      params,
      organisationId,
      'visit_analyzer_models',
      id,
      endpoint,
    );
  },
};

export default visitAnalyzerService;
