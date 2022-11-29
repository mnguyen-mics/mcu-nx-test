import { injectable } from 'inversify';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import PluginInstanceService from '../PluginInstanceService';
import { VisitAnalyzer } from '../../models/Plugins';
import { PluginLayout } from '../../models/plugin/PluginLayout';

export interface IVisitAnalyzerService extends PluginInstanceService<VisitAnalyzer> {
  getVisitAnalyzers: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<VisitAnalyzer>>;
  deleteVisitAnalyzerProperty: (id: string, options?: object) => Promise<DataResponse<any>>;
  getLocalizedPluginLayout: (pInstanceId: string) => Promise<PluginLayout | null>;
}

@injectable()
export class VisitAnalyzerService
  extends PluginInstanceService<VisitAnalyzer>
  implements IVisitAnalyzerService
{
  constructor() {
    super('visit_analyzer_models');
  }

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
  }

  deleteVisitAnalyzerProperty(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `visit_analyzer_models/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const visitAnalyzer = res.data;
      return this._pluginService
        .findPluginFromVersionId(visitAnalyzer.version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            visitAnalyzer.version_id,
          );
        });
    });
  }
}
