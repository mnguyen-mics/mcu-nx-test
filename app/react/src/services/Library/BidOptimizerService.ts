import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { BidOptimizer } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';

class BidOptimizerService extends PluginInstanceService<BidOptimizer> {
  constructor() {
    super("bid_optimizers")
  }

  getBidOptimizers(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<BidOptimizer>> {
    const endpoint = 'bid_optimizers';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  deleteBidOptimizer(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `bid_optimizers/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  };


  // OLD WAY AND DUMB WAY TO DO IT, TO CHANGE
  getBidOptimizerProperties(id: string, options: object = {}) {
    const endpoint = `bid_optimizers/${id}/properties`;

    return ApiService.getRequest(endpoint, options).then((res: any) => {
      return { ...res.data, id };
    });
  };

};

export default new BidOptimizerService();
