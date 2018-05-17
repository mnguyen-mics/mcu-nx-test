import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  AttributionModelCreateRequest,
  AttributionModelResource,
} from '../models/goal';
import { PropertyResourceShape } from '../models/plugin'


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

  getAttributionModelProperties(
    attributionModelId: string,
  ): Promise<DataListResponse<PropertyResourceShape>> {
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
}

export default AttributionModelService;
