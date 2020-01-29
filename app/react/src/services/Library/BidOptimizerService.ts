import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { BidOptimizer, PluginProperty } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import { PluginLayout } from '../../models/plugin/PluginLayout';
import { injectable } from 'inversify';

export interface IBidOptimizerService
  extends PluginInstanceService<BidOptimizer> {
  getBidOptimizers: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<BidOptimizer>>;
  deleteBidOptimizer: (
    id: string,
    options?: object,
  ) => Promise<DataResponse<BidOptimizer>>;
  getBidOptimizerProperties: (
    id: string,
    options?: object,
  ) => Promise<DataListResponse<PluginProperty>>;
}

@injectable()
export class BidOptimizerService extends PluginInstanceService<BidOptimizer>
  implements IBidOptimizerService {
  constructor() {
    super('bid_optimizers');
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
  }

  deleteBidOptimizer(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `bid_optimizers/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  }

  getBidOptimizerProperties(
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PluginProperty>> {
    const endpoint = `bid_optimizers/${id}/properties`;
    return ApiService.getRequest(endpoint, options);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const bidOptimizer = res.data;
      return this._pluginService
        .findPluginFromVersionId(bidOptimizer.engine_version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            bidOptimizer.engine_version_id,
          );
        });
    });
  }
}
