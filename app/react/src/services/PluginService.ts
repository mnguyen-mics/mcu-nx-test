import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PluginInterface, PluginVersion } from '../models/Plugins';
import { PropertyResourceShape } from '../models/plugin';
import DataFileService from './DataFileService';

const pluginService = {
  getPlugins(options: object = {}): Promise<DataListResponse<PluginInterface>> {
    const endpoint = 'plugins';
    return ApiService.getRequest(endpoint, options);
  },
  getPluginVersions(pluginId: string, params: object = {}): Promise<DataListResponse<PluginInterface>> {
    const endpoint = `plugins/${pluginId}/versions`;
    return ApiService.getRequest(endpoint, params);
  },
  getPluginVersionProperty(pluginId: string, pluginVersionId: string, params: object = {}): Promise<PropertyResourceShape[]> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties`;
    return ApiService.getRequest(endpoint, params).then((res: DataListResponse<PropertyResourceShape>) => res.data);
  },
  getEngineProperties(engineVersionId: string): Promise<PropertyResourceShape[]> {
    const endpoint = `plugins/${engineVersionId}/properties`;

    return ApiService.getRequest(endpoint).then((res: DataListResponse<PropertyResourceShape>) => res.data);
  },
  getEngineVersion(engineVersionId: string): Promise<PluginVersion> {
    const endpoint = `plugins/version/${engineVersionId}`;
    return ApiService.getRequest(endpoint).then((res: DataResponse<PluginVersion>) => {
      return res.data;
    });
  },
  getAdLayouts(organisationId: string, pluginVersionId: string): Promise<any> {
    const endpoint = `ad_layouts?organisation_id=${organisationId}&renderer_version_id=${pluginVersionId}`;
    return ApiService.getRequest(endpoint).then((res: any) => res.data);
  },
  getAdLayoutVersion(organisationId: string, adLayoutVersion: string): Promise<PluginVersion[]> {
    const endpoint = `ad_layouts/${adLayoutVersion}/versions`;
    const params = {
      organisation_id: organisationId,
      statuses: 'DRAFT,PUBLISHED',
    };
    return ApiService.getRequest(endpoint, params).then((res: DataListResponse<PluginVersion>) => res.data);
  },
  getStyleSheets(organisationId: string): Promise<any> {
    const endpoint = `style_sheets?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint).then((res: DataListResponse<any>) => res.data);
  },
  getStyleSheetsVersion(organisationId: string, styleSheetId: string): Promise<PluginVersion[]> {
    const endpoint = `style_sheets/${styleSheetId}/versions`;
    const params = {
      organisation_id: organisationId,
      statuses: 'DRAFT,PUBLISHED',
    };
    return ApiService.getRequest(endpoint, params).then((res: DataListResponse<PluginVersion>) => res.data);
  },
  handleSaveOfProperties(
    params: any,
    organisationId: string,
    objectType: string,
    objectId: string,
    endpoint: string,
  ): Promise<DataResponse<PropertyResourceShape> | void> {
    if (params.property_type === 'ASSET') {
      const uploadEndpoint = `asset_files?organisation_id=${organisationId}`;
      if (params.value && params.value.length === 0) {
        return Promise.resolve();
      }

      const fileValue = (params.value && params.value.file) ? params.value.file : null;

      if (fileValue !== null) {
        const formData = new FormData(); /* global FormData */
        formData.append('file', fileValue, fileValue.name);
        return ApiService.postRequest(uploadEndpoint, formData)
        .then((res: any) => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            original_file_name: res.data.original_filename,
            file_path: res.data.file_path,
            asset_id: res.data.id,
          };
          ApiService.putRequest(endpoint, newParams);
        });
      }
      return Promise.resolve();

    } else if (params.property_type === 'DATA_FILE') {
      // build formData
      const blob = new Blob([params.value.fileContent], { type: 'application/octet-stream' }); /* global Blob */
      if (params.value.uri) {
        // edit
        return DataFileService.editDataFile(params.value.fileName, params.value.uri, blob).then(() => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            uri: params.value.uri,
            last_modified: null,
          };
          return ApiService.putRequest(endpoint, newParams) as Promise<DataResponse<PropertyResourceShape>>;
        });

      } else if (params.value.fileName && params.value.fileContent) {
        // create
        return DataFileService.createDatafile(organisationId, objectType, objectId, params.value.fileName, blob)
          .then((res: any) => {
            const newParams = {
              ...params,
            };
            newParams.value = {
              uri: res,
              last_modified: null,
            };
            return ApiService.putRequest(endpoint, newParams) as Promise<DataResponse<PropertyResourceShape>>;
          });
      } else if (!params.value.fileName && !params.value.fileContent && !params.value.uri) {
        // delete
        const newParams = {
          ...params,
        };
        newParams.value = {
          uri: null,
          last_modified: null,
        };
        return ApiService.putRequest(endpoint, newParams);
      }
      return Promise.resolve();
    }

    return ApiService.putRequest(endpoint, params);
  },
};

export default pluginService;
