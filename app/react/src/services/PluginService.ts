import {
  Adlayout,
  AdLayoutVersionResource,
  StylesheetVersionResource,
  PluginType,
  PluginPresetProperty,
} from './../models/Plugins';
import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PluginResource, PluginPresetResource, PluginVersionResource } from '../models/Plugins';
import { PropertyResourceShape } from '../models/plugin';
import { IDataFileService } from './DataFileService';
import { PluginLayout } from '../models/plugin/PluginLayout';
import log from '../utils/Logger';
import { Omit } from '../utils/Types';
import { injectable, inject } from 'inversify';
import { TYPES } from '../constants/types';
import { IAssetFileService } from './Library/AssetFileService';

// TODO Pagination is disabled for now waiting for an api param
// to allow filtering of plugin without version and/or with current version not archived
interface GetPluginOptions extends Omit<PaginatedApiParam, 'first_result'> {
  plugin_type?: PluginType;
  artifact_id?: string;
  group_id?: string;
  organisation_id?: number;
}

interface GetPluginPresetOptions extends Omit<PaginatedApiParam, 'first_result'> {
  plugin_type?: PluginType;
  organisation_id?: number;
}

interface PostPluginPresetResource {
  organisation_id: string;
  name: string;
  description?: string;
  plugin_type: PluginType;
  properties: PluginPresetProperty[];
}

export interface IPluginService {
  getPlugins: (
    options: GetPluginOptions,
    withArchivedPluginVersion?: boolean,
  ) => Promise<DataListResponse<PluginResource>>;
  getPlugin: (id: string) => Promise<DataResponse<PluginResource>>;
  getPluginVersions: (
    pluginId: string,
    params?: object,
  ) => Promise<DataListResponse<PluginVersionResource>>;
  findPluginFromVersionId: (versionId: string) => Promise<DataResponse<PluginResource>>;
  getPluginVersion: (
    pluginId: string,
    versionId: string,
  ) => Promise<DataResponse<PluginVersionResource>>;
  getPluginVersionProperties: (
    pluginId: string,
    pluginVersionId: string,
    params?: object,
  ) => Promise<DataListResponse<PropertyResourceShape>>;
  getEngineProperties: (engineVersionId: string) => Promise<PropertyResourceShape[]>;
  getEngineVersion: (engineVersionId: string) => Promise<PluginVersionResource>;
  getAdLayouts: (
    organisationId: string,
    pluginVersionId: string,
  ) => Promise<DataListResponse<Adlayout>>;
  getAdLayoutVersion: (
    organisationId: string,
    adLayoutVersion: string,
  ) => Promise<DataListResponse<AdLayoutVersionResource>>;
  handleSaveOfProperties: (
    params: any,
    organisationId: string,
    objectType: string,
    objectId: string,
    endpoint: string,
  ) => Promise<DataResponse<PropertyResourceShape> | void>;
  getLocalizedPluginLayout: (
    pluginId: string,
    pluginVersionId: string,
    locale?: string,
  ) => Promise<PluginLayout | null>;
  getPluginPresets: (
    options: GetPluginPresetOptions,
  ) => Promise<DataListResponse<PluginPresetResource>>;
  getStyleSheets: (organisationId: string) => Promise<DataListResponse<any>>;
  getStyleSheetsVersion: (
    organisationId: string,
    styleSheetId: string,
  ) => Promise<DataListResponse<StylesheetVersionResource>>;
  getLocalizedPluginLayoutFromVersionId: (
    pluginVersionId: string,
  ) => Promise<{ plugin: PluginResource; layout?: PluginLayout }>;
  createPluginPreset: (
    pluginId: string,
    pluginVersionId: string,
    resource: PostPluginPresetResource,
  ) => Promise<DataResponse<PluginPresetResource>>;
  deletePluginPreset: (
    pluginId: string,
    pluginVersionId: string,
    pluginPresetId: string,
    resource: Partial<PluginPresetResource>,
  ) => Promise<DataResponse<PluginPresetResource>>;
}

@injectable()
export class PluginService implements IPluginService {
  @inject(TYPES.IAssetFileService)
  private _assetFileService: IAssetFileService;

  @inject(TYPES.IDataFileService)
  private _dataFileService: IDataFileService;

  getPlugins(
    options: GetPluginOptions = {},
    withArchivedPluginVersion: boolean = false,
  ): Promise<DataListResponse<PluginResource>> {
    const endpoint = 'plugins';
    return ApiService.getRequest<DataListResponse<PluginResource>>(endpoint, options).then(
      plugins => {
        if (!withArchivedPluginVersion) {
          return Promise.all(
            plugins.data.reduce((filteredPlugins, p) => {
              if (p.current_version_id) {
                return [
                  ...filteredPlugins,
                  this.getPluginVersion(p.id, p.current_version_id).then(pv => pv.data),
                ];
              }
              return filteredPlugins;
            }, []),
          ).then(pluginVersions => {
            const archivedPVersion = pluginVersions.filter(
              (pv: PluginVersionResource) => !!pv.archived,
            );
            return {
              ...plugins,
              data: plugins.data.filter(
                p =>
                  !archivedPVersion.find(
                    (apv: PluginVersionResource) => apv.id === p.current_version_id,
                  ),
              ),
            };
          });
        }
        return plugins;
      },
    );
  }
  getPluginVersions(
    pluginId: string,
    params: object = {},
  ): Promise<DataListResponse<PluginVersionResource>> {
    const endpoint = `plugins/${pluginId}/versions`;
    return ApiService.getRequest(endpoint, params);
  }
  getPlugin(pluginId: string): Promise<DataResponse<PluginResource>> {
    const endpoint = `plugins/${pluginId}`;
    return ApiService.getRequest(endpoint);
  }
  findPluginFromVersionId(versionId: string): Promise<DataResponse<PluginResource>> {
    const endpoint = `plugins/version/${versionId}`;
    return ApiService.getRequest(endpoint);
  }
  getPluginVersion(
    pluginId: string,
    versionId: string,
  ): Promise<DataResponse<PluginVersionResource>> {
    const endpoint = `plugins/${pluginId}/versions/${versionId}`;
    return ApiService.getRequest(endpoint);
  }
  getPluginVersionProperties(
    pluginId: string,
    pluginVersionId: string,
    params: object = {},
  ): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties`;
    return ApiService.getRequest(endpoint, params);
  }
  getPluginPresets(
    options: GetPluginPresetOptions = {},
  ): Promise<DataListResponse<PluginPresetResource>> {
    const endpoint = `plugins.versions.presets`;
    return ApiService.getRequest(endpoint, options);
  }
  createPluginPreset(
    pluginId: string,
    pluginVersionId: string,
    resource: PostPluginPresetResource,
  ): Promise<DataResponse<PluginPresetResource>> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/presets`;
    return ApiService.postRequest(endpoint, resource);
  }
  deletePluginPreset(
    pluginId: string,
    pluginVersionId: string,
    pluginPresetId: string,
    resource: Partial<PluginPresetResource>,
  ): Promise<DataResponse<PluginPresetResource>> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/presets/${pluginPresetId}`;

    return ApiService.putRequest(endpoint, resource);
  }
  getEngineProperties(engineVersionId: string): Promise<PropertyResourceShape[]> {
    const endpoint = `plugins/${engineVersionId}/properties`;

    return ApiService.getRequest(endpoint).then(
      (res: DataListResponse<PropertyResourceShape>) => res.data,
    );
  }
  getEngineVersion(engineVersionId: string): Promise<PluginVersionResource> {
    const endpoint = `plugins/version/${engineVersionId}`;
    return ApiService.getRequest(endpoint).then((res: DataResponse<PluginVersionResource>) => {
      return res.data;
    });
  }
  getAdLayouts(
    organisationId: string,
    pluginVersionId: string,
  ): Promise<DataListResponse<Adlayout>> {
    const endpoint = `ad_layouts?organisation_id=${organisationId}&renderer_version_id=${pluginVersionId}`;
    return ApiService.getRequest(endpoint);
  }
  getAdLayoutVersion(
    organisationId: string,
    adLayoutVersion: string,
  ): Promise<DataListResponse<AdLayoutVersionResource>> {
    const endpoint = `ad_layouts/${adLayoutVersion}/versions`;
    const params = {
      organisation_id: organisationId,
      statuses: 'DRAFT,PUBLISHED',
    };
    return ApiService.getRequest(endpoint, params);
  }
  getStyleSheets(organisationId: string): Promise<DataListResponse<any>> {
    const endpoint = `style_sheets?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
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
  }
  handleSaveOfProperties(
    params: any,
    organisationId: string,
    objectType: string,
    objectId: string,
    endpoint: string,
  ): Promise<DataResponse<PropertyResourceShape> | void> {
    if (
      params.property_type === 'ASSET' ||
      params.property_type === 'ASSET_FILE' ||
      params.property_type === 'ASSET_FOLDER'
    ) {
      let uploadEndpoint = `asset_files?organisation_id=${organisationId}`;

      if (params.property_type === 'ASSET_FOLDER') {
        uploadEndpoint = `assets?organisation_id=${organisationId}&asset_type=FOLDER`;
      }

      if (params.value && params.value.length === 0) {
        return Promise.resolve();
      }

      const fileValue = params.value && params.value.file ? params.value.file : null;

      if (fileValue !== null) {
        const formData = new FormData(); /* global FormData */
        formData.append('file', fileValue, fileValue.name);
        return ApiService.postRequest(uploadEndpoint, formData).then((res: any) => {
          const newParams = {
            ...params,
          };
          newParams.value = {
            original_name: res.data.original_name,
            path: res.data.path,
            asset_id: res.data.id,
          };
          ApiService.putRequest(endpoint, newParams);
        });
      }
      return Promise.resolve();
    } else if (params.property_type === 'NATIVE_IMAGE') {
      if (params.value && params.value.length === 0) {
        return Promise.resolve();
      }

      const fileValue = params.value && params.value.file ? params.value.file : null;

      if (fileValue !== null) {
        const formData = new FormData(); /* global FormData */
        formData.append('file', fileValue, fileValue.name);

        return this._assetFileService.uploadAssetsFile(organisationId, formData).then(res => {
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
        return this._dataFileService
          .editDataFile(params.value.fileName, params.value.uri, blob)
          .then(() => {
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
        return this._dataFileService
          .createDatafile(organisationId, objectType, objectId, params.value.fileName, blob)
          .then((res: any) => {
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
  }
  getLocalizedPluginLayout(
    pluginId: string,
    pluginVersionId: string,
    locale: string = 'en-US',
  ): Promise<PluginLayout | null> {
    const endpoint = `plugins/${pluginId}/versions/${pluginVersionId}/properties_layout?locale=${locale}`;
    return ApiService.getRequest<DataResponse<PluginLayout>>(endpoint)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        log.warn('Cannot retrieve plugin layout', err);
        return null;
      });
  }

  getLocalizedPluginLayoutFromVersionId(
    pluginVersionId: string,
  ): Promise<{ plugin: PluginResource; layout?: PluginLayout }> {
    return this.findPluginFromVersionId(pluginVersionId).then(pluginResponse => {
      if (
        pluginResponse !== null &&
        pluginResponse.status !== 'error' &&
        pluginResponse.data.current_version_id
      ) {
        return this.getLocalizedPluginLayout(pluginResponse.data.id, pluginVersionId).then(res => {
          return { plugin: pluginResponse.data, layout: res || undefined };
        });
      } else return { plugin: pluginResponse.data, layout: undefined };
    });
  }
}

export default PluginService;
