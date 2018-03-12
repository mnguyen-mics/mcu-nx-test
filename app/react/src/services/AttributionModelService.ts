import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  AttributionModelCreateRequest,
  AttributionModelResource,
} from '../models/goal';
import { PropertyResourceShape } from '../models/plugin';
import { PluginProperty } from '../models/Plugins';
import PluginService from './PluginService';

const AttributionModelService = {
  getAttributionModels(
    organisationId: string,
    options: PaginatedApiParam = {},
  ): Promise<DataListResponse<AttributionModelResource>> {
    const endpoint = 'attribution_models';
    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },

  getAttributionModel(
    attributionModelId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `attribution_models/${attributionModelId}`;

    return ApiService.getRequest(endpoint);
  },

  updateAttributionModel(
    attributionModelId: string,
    body: object= {},
  ): Promise<DataResponse<PluginProperty>> {
    const endpoint = `attribution_models/${attributionModelId}`;

    return ApiService.putRequest(endpoint, body);
  },

  getAttributionModelProperties(
    attributionModelId: string,
  ): Promise<DataListResponse<PluginProperty>> {
    const endpoint = `attribution_models/${attributionModelId}/properties`;
    return ApiService.getRequest(endpoint);
  },

  createAttributionModel(
    organisationId: string,
    resource: AttributionModelCreateRequest,
  ): Promise<DataResponse<AttributionModelResource>> {
    const endpoint = `attribution_models?organisation_id=${organisationId}`;

    return ApiService.postRequest(endpoint, resource);
  },

  updateAttributionProperty(
    attributionModelId: string,
    technicalName: string,
    value: any,
  ): Promise<DataResponse<PropertyResourceShape>> {
    const endpoint = `attribution_models/${attributionModelId}/properties/technical_name=${technicalName}`;
    const body = {
      technical_name: technicalName,
      value: { value },
    };
    return ApiService.putRequest(endpoint, body);
  },
  deleteAttributionModel(
    attributionModelId: string,
  ): Promise<DataResponse<AttributionModelResource>> {
    const endpoint = `attribution_models/${attributionModelId}`;

    return ApiService.deleteRequest(endpoint);
  },
  updateAttributionModelProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PluginProperty> | void> {
    const endpoint = `attribution_models/${id}/properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(
      params,
      organisationId,
      'attribution_models',
      id,
      endpoint,
    );
  },
};

export default AttributionModelService;
