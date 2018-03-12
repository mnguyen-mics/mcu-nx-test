// import { DataResponse } from '../ApiService';
// import PluginService from '../PluginService';
// import { PluginProperty } from '../../models/Plugins';

const AttributionModelService = {
  // getAttributionModels(
  //   organisationId: string,
  //   options: object = {},
  // ): Promise<DataListResponse<AttributionModel>> {
  //   const endpoint = 'attribution_models';
  //   const params = {
  //     organisation_id: organisationId,
  //     ...options,
  //   };
  //   return ApiService.getRequest(endpoint, params);
  // },
  // getAttributionModel(
  //   id: string,
  //   options: object = {},
  // ): Promise<DataResponse<AttributionModel>> {
  //   const endpoint = `attribution_models/${id}`;

  //   const params = {
  //     ...options,
  //   };
  //   return ApiService.getRequest(endpoint, params);
  // },
  // deleteAttributionModel(
  //   id: string,
  //   options: object = {},
  // ): Promise<DataResponse<any>> {
  //   const endpoint = `attribution_models/${id}`;

  //   const params = {
  //     ...options,
  //   };
  //   return ApiService.deleteRequest(endpoint, params);
  // },
  // getAttributionModelProperties(
  //   id: string,
  //   options: object = {},
  // ): Promise<DataListResponse<PluginProperty>> {
  //   const endpoint = `attribution_models/${id}/properties`;

  //   const params = {
  //     ...options,
  //   };
  //   return ApiService.getRequest(endpoint, params);
  // },
  // createAttributionModel(
  //   organisationId: string,
  //   options: object = {},
  // ): Promise<DataResponse<AttributionModel>> {
  //   const endpoint = `attribution_models?organisation_id=${organisationId}`;
  //   const params = {
  //     ...options,
  //   };
  //   return ApiService.postRequest(endpoint, params);
  // },
  // updateAttributionModel(
  //   id: string,
  //   options: object = {},
  // ): Promise<DataResponse<PluginProperty>> {
  //   const endpoint = `attribution_models/${id}`;
  //   const params = {
  //     ...options,
  //   };
  //   return ApiService.putRequest(endpoint, params);
  // },
  // updateAttributionModelProperty(
  //   organisationId: string,
  //   id: string,
  //   technicalName: string,
  //   params: object = {},
  // ): Promise<DataResponse<PluginProperty> | void> {
  //   const endpoint = `attribution_models/${id}/properties/technical_name=${technicalName}`;
  //   return PluginService.handleSaveOfProperties(
  //     params,
  //     organisationId,
  //     'attribution_models',
  //     id,
  //     endpoint,
  //   );
  // },
};

export default AttributionModelService;
