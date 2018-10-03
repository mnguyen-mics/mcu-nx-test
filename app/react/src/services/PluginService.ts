import { Adlayout, StylesheetVersionResource, PluginType } from './../models/Plugins';
import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PluginResource, PluginVersionResource } from '../models/Plugins';
import { PropertyResourceShape } from '../models/plugin';
import DataFileService from './DataFileService';
import AssetsFilesService from './Library/AssetsFilesService';
import { PluginLayout } from '../models/plugin/PluginLayout';
import log from '../utils/Logger';

interface GetPluginOptions extends PaginatedApiParam {
  plugin_type?: PluginType;
  artifact_id?: string;
  group_id?: string;
  organisation_id?: number;
}

const pluginService = {
  getPlugins(
    options: GetPluginOptions = {},
    withArchivedPluginVersion: boolean = false,
  ): Promise<DataListResponse<PluginResource>> {
    const endpoint = 'plugins';
    return ApiService.getRequest<DataListResponse<PluginResource>>(endpoint, options).then(plugins => {
      if (!withArchivedPluginVersion) {
        return Promise.all(
          plugins.data.map(p =>
            pluginService.getPluginVersion(p.id, p.current_version_id).then(pv => pv.data)
          )
        ).then(pluginVersions => {
          const archivedPVersion = pluginVersions.filter(pv => !!pv.archived);
          return {
            ...plugins,
            data: plugins.data.filter(p => !archivedPVersion.find(apv => apv.id === p.current_version_id))
          }
        });
      }
      return plugins;
    });
  },
  getPluginVersions(
    pluginId: string,
    params: object = {},
  ): Promise<DataListResponse<PluginVersionResource>> {
    const endpoint = `plugins/${pluginId}/versions`;
    return ApiService.getRequest(endpoint, params);
  },
  findPluginFromVersionId(
    versionId: string,
  ): Promise<DataResponse<PluginResource>> {
    const endpoint = `plugins/version/${versionId}`;
    return ApiService.getRequest(endpoint);
  },
  getPluginVersion(
    pluginId: string,
    versionId: string,
  ): Promise<DataResponse<PluginVersionResource>> {
    const endpoint = `plugins/${pluginId}/versions/${versionId}`;
    return ApiService.getRequest(endpoint);
  },
  getPluginVersionProperty(pluginId: string, pluginVersionId: string, params: object = {}): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties`;
    return ApiService.getRequest(endpoint, params);
  },
  getEngineProperties(
    engineVersionId: string,
  ): Promise<PropertyResourceShape[]> {
    const endpoint = `plugins/${engineVersionId}/properties`;

    return ApiService.getRequest(endpoint).then(
      (res: DataListResponse<PropertyResourceShape>) => res.data,
    );
  },
  getEngineVersion(engineVersionId: string): Promise<PluginVersionResource> {
    const endpoint = `plugins/version/${engineVersionId}`;
    return ApiService.getRequest(endpoint).then(
      (res: DataResponse<PluginVersionResource>) => {
        return res.data;
      },
    );
  },
  getAdLayouts(
    organisationId: string,
    pluginVersionId: string,
  ): Promise<DataListResponse<Adlayout>> {
    const endpoint = `ad_layouts?organisation_id=${organisationId}&renderer_version_id=${pluginVersionId}`;
    return ApiService.getRequest(endpoint);
  },
  getAdLayoutVersion(
    organisationId: string,
    adLayoutVersion: string,
  ): Promise<DataListResponse<any>> {
    const endpoint = `ad_layouts/${adLayoutVersion}/versions`;
    const params = {
      organisation_id: organisationId,
      statuses: 'DRAFT,PUBLISHED',
    };
    return ApiService.getRequest(endpoint, params);
  },
  getStyleSheets(organisationId: string): Promise<DataListResponse<any>> {
    const endpoint = `style_sheets?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  },
  getStyleSheetsVersion(
    organisationId: string,
    styleSheetId: string,
  ): Promise<DataListResponse<StylesheetVersionResource>> {
    const endpoint = `style_sheets/${styleSheetId}/versions`;
    const params = {
      organisation_id: organisationId,
      statuses: 'DRAFT,PUBLISHED',
    };
    return ApiService.getRequest(endpoint, params);
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

      const fileValue =
        params.value && params.value.file ? params.value.file : null;

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
          },
          );
      }
      return Promise.resolve();
    } else if (params.property_type === 'NATIVE_IMAGE') {
      if (params.value && params.value.length === 0) {
        return Promise.resolve();
      }

      const fileValue =
        params.value && params.value.file ? params.value.file : null;

      if (fileValue !== null) {
        const formData = new FormData(); /* global FormData */
        formData.append('file', fileValue, fileValue.name);

        return AssetsFilesService.uploadAssetsFile(
          organisationId,
          formData,
        ).then(res => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            original_file_name: res.data.original_name,
            file_path: res.data.path,
            asset_id: res.data.id,
            require_display: true,
            height: res.data.height,
            width: res.data.width,
            type: 1,
          };
          ApiService.putRequest(endpoint, newParams);
        });
      }
      return Promise.resolve();
    } else if (params.property_type === 'DATA_FILE') {
      // build formData
      const blob = new Blob([params.value.fileContent], {
        type: 'application/octet-stream',
      }); /* global Blob */
      if (params.value.uri) {
        // edit
        return DataFileService.editDataFile(
          params.value.fileName,
          params.value.uri,
          blob,
        ).then(() => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            uri: params.value.uri,
            last_modified: null,
          };
          return ApiService.putRequest(endpoint, newParams) as Promise<
            DataResponse<PropertyResourceShape>
            >;
        });
      } else if (params.value.fileName && params.value.fileContent) {
        // create
        return DataFileService.createDatafile(
          organisationId,
          objectType,
          objectId,
          params.value.fileName,
          blob,
        ).then((res: any) => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            uri: res,
            last_modified: null,
          };
          return ApiService.putRequest(endpoint, newParams) as Promise<
            DataResponse<PropertyResourceShape>
            >;
        });
      } else if (
        !params.value.fileName &&
        !params.value.fileContent &&
        !params.value.uri
      ) {
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
  getLocalizedPluginLayout(pluginId: string, pluginVersionId: string, locale: string = "en-US"): Promise<PluginLayout | null> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties_layout?locale=${locale}`;
    return ApiService.getRequest<DataResponse<PluginLayout>>(endpoint)
      .then(res => { return res.data })
      .catch(err => {
        log.warn("Cannot retrieve plugin layout", err);
        return null;
      });
  },
};

export default pluginService;
