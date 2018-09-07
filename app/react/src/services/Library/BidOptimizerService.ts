import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { BidOptimizer } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import PluginService from '../PluginService';
import { PluginLayout } from '../../models/plugin/PluginLayout';

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

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const bidOptimizer = res.data;
      return PluginService.findPluginFromVersionId(bidOptimizer.engine_version_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          bidOptimizer.engine_version_id
        );
      });      
    });
  }

};

export default new BidOptimizerService();
