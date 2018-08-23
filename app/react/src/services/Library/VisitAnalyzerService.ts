import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import PluginInstanceService from '../PluginInstanceService';
import { VisitAnalyzer } from '../../models/Plugins';
import PluginService from '../PluginService';
import { PluginLayout } from '../../models/plugin/PluginLayout';

class VisitAnalyzerService extends PluginInstanceService<VisitAnalyzer> {
  constructor() {
    super("visit_analyzer_models")
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
  }; 

  deleteVisitAnalyzerProperty(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `visit_analyzer_models/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  };

  getLocalizedPluginLayout(pInstanceId: string): Promise<DataResponse<PluginLayout> | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const visitAnalyzer = res.data;
      return PluginService.findPluginFromVersionId(visitAnalyzer.version_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          visitAnalyzer.version_id
        );
      });
    });
  }
 
 }

const visitAnalyzerService = new VisitAnalyzerService()

export default visitAnalyzerService;
