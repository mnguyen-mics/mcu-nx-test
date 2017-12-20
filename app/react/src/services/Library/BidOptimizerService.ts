import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import PluginService from '../PluginService';
import { PropertyResourceShape, BidOptimizer } from '../../models/Plugins';

const bidOptimizerService = {
  getBidOptimizers(organisationId: string, options: object = {}): Promise<DataListResponse<BidOptimizer>> {
    const endpoint = 'bid_optimizers';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  deleteBidOptimizer(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `bid_optimizers/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  },
  getBidOptimizerProperty(id: string, options: object = {}): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `bid_optimizers/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  },
  // OLD WAY AND DUMB WAY TO DO IT, TO CHANGE
  getBidOptimizerProperties(id: string, options: object = {}) {
    const endpoint = `bid_optimizers/${id}/properties`;

    return ApiService.getRequest(endpoint, options).then((res: any) => { return { ...res.data, id }; });
  },
  getBidOptimizer(id: string, options: object = {}): Promise<DataResponse<BidOptimizer>> {
    const endpoint = `bid_optimizers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  createBidOptimizer(organisationId: string, options: object = {}): Promise<DataResponse<BidOptimizer>> {
    const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  },
  updateBidOptimizer(id: string, options: object = {}): Promise<DataResponse<BidOptimizer>> {
    const endpoint = `bid_optimizers/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  },
  updateBidOptimizerProperty(
    organisationId: string, id: string, technicalName: string, params: object = {}): Promise<DataResponse<PropertyResourceShape> | void> {
    const endpoint = `bid_optimizers/${id}/properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(params, organisationId, 'bid_optimizers', id, endpoint);
  },
};

export default bidOptimizerService;
