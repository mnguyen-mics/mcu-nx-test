import {
  AudienceFeatureFolderResource,
  AudienceFeatureSearchResponseResource,
  AudienceFeatureSegmentsMappingResource,
  AudienceFeatureVariableResource,
} from './../models/audienceFeature/AudienceFeatureResource';
import { AudienceFeatureResource } from '../models/audienceFeature';
import { injectable } from 'inversify';
import { PaginatedApiParam, getPaginatedApiParam } from '../utils/ApiHelper';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PublicJobExecutionResource } from '../models/Job/JobResource';
export interface ReferenceTableValue {
  values: string[];
}
export interface AudienceFeatureSearchSettings {
  currentPage?: number;
  pageSize?: number;
  keywords?: string;
  exclude?: string[];
  finalValues?: string;
}

export interface AudienceFeatureOptions extends PaginatedApiParam {
  keywords?: string[];
  exclude?: string[];
  folder_id?: string;
  values?: string[];
}

export interface IAudienceFeatureService {
  // Audience Features
  getAudienceFeatures: (
    datamartId: string,
    options?: AudienceFeatureOptions,
  ) => Promise<DataListResponse<AudienceFeatureResource>>;
  getAudienceFeature: (
    datamartId: string,
    audienceFeatureId: string,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
  createAudienceFeature: (
    datamartId: string,
    body: Partial<AudienceFeatureResource>,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
  updateAudienceFeature: (
    datamartId: string,
    audienceFeatureId: string,
    body: Partial<AudienceFeatureResource>,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
  deleteAudienceFeature: (
    datamartId: string,
    audienceFeatureId: string,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
  searchAudienceFeatures: (
    datamartId: string,
    options?: AudienceFeatureOptions,
  ) => Promise<DataResponse<AudienceFeatureSearchResponseResource>>;
  extractAudienceFeatureVariables: (
    datamartId: string,
    objectTreeExpression: string,
    adressableObject?: string,
  ) => Promise<DataListResponse<AudienceFeatureVariableResource>>;
  // Audience Feature Folders
  getAudienceFeatureFolders: (
    datamartId: string,
  ) => Promise<DataListResponse<AudienceFeatureFolderResource>>;
  createAudienceFeatureFolder: (
    datamartId: string,
    body: Partial<AudienceFeatureFolderResource>,
  ) => Promise<DataResponse<AudienceFeatureFolderResource>>;
  getAudienceFeatureFolder: (
    datamartId: string,
    folderId: string,
  ) => Promise<DataResponse<AudienceFeatureFolderResource>>;
  updateAudienceFeatureFolder: (
    datamartId: string,
    folderId: string,
    body: Partial<AudienceFeatureFolderResource>,
  ) => Promise<DataResponse<AudienceFeatureFolderResource>>;
  deleteAudienceFeatureFolder: (
    datamartId: string,
    folderId: string,
  ) => Promise<DataResponse<AudienceFeatureFolderResource>>;
  fetchFoldersAndFeatures: (
    datamartId: string,
    setFoldersAndFeatures: (
      folders: AudienceFeatureFolderResource[],
      baseFeatures: AudienceFeatureResource[],
      total?: number,
      isJobExecutionExisting?: boolean,
    ) => void,
    onFailure: (err: any) => void,
    filter?: AudienceFeatureSearchSettings,
    checkJobExecutions?: boolean,
  ) => Promise<void>;
  buildAudienceFeatureOptions: (
    filter?: AudienceFeatureSearchSettings,
    folderId?: string,
  ) => AudienceFeatureOptions;
  getAudienceFeatureSegmentsMapping: (
    datamartId: string,
    audienceFeatureId: string,
  ) => Promise<DataResponse<AudienceFeatureSegmentsMappingResource>>;

  getFinalValues: (
    datamartId: string,
    runtimeSchemaId: string,
    options?: { keywords: string },
  ) => Promise<DataResponse<ReferenceTableValue>>;

  getReferenceTableJobExecutions: (
    datamartId: string,
  ) => Promise<DataListResponse<PublicJobExecutionResource>>;
}

@injectable()
export class AudienceFeatureService implements IAudienceFeatureService {
  getAudienceFeatures(
    datamartId: string,
    options?: AudienceFeatureOptions,
  ): Promise<DataListResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features`;
    return ApiService.getRequest(endpoint, options);
  }

  getAudienceFeature(
    datamartId: string,
    audienceFeatureId: string,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}`;
    return ApiService.getRequest(endpoint);
  }

  createAudienceFeature(
    datamartId: string,
    body: Partial<AudienceFeatureResource>,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features`;
    return ApiService.postRequest(endpoint, body);
  }

  updateAudienceFeature(
    datamartId: string,
    audienceFeatureId: string,
    body: Partial<AudienceFeatureResource>,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}`;
    if (body.folder_id === '') {
      body.folder_id = null;
    }
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceFeature(
    datamartId: string,
    audienceFeatureId: string,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}`;
    return ApiService.deleteRequest(endpoint);
  }

  searchAudienceFeatures(
    datamartId: string,
    options?: AudienceFeatureOptions,
  ): Promise<DataResponse<AudienceFeatureSearchResponseResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/search`;
    return ApiService.getRequest(endpoint, options);
  }

  extractAudienceFeatureVariables(
    datamartId: string,
    objectTreeExpression: string,
    adressableObject?: string,
  ): Promise<DataListResponse<AudienceFeatureVariableResource>> {
    let endpoint;
    if (adressableObject === undefined) {
      endpoint = `datamarts/${datamartId}/audience_features/extract_variables?object_tree_expression=${objectTreeExpression}`;
    } else {
      endpoint = `datamarts/${datamartId}/audience_features/extract_variables?object_tree_expression=${objectTreeExpression}&addressable_object=${adressableObject}`;
    }
    return ApiService.getRequest(endpoint);
  }

  // Folders

  getAudienceFeatureFolders(
    datamartId: string,
  ): Promise<DataListResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders`;
    return ApiService.getRequest(endpoint);
  }

  createAudienceFeatureFolder(
    datamartId: string,
    body: Partial<AudienceFeatureFolderResource>,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders`;
    return ApiService.postRequest(endpoint, body);
  }

  getAudienceFeatureFolder(
    datamartId: string,
    folderId: string,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders/${folderId}`;
    return ApiService.getRequest(endpoint);
  }

  updateAudienceFeatureFolder(
    datamartId: string,
    folderId: string,
    body: Partial<AudienceFeatureFolderResource>,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders/${folderId}`;
    if (body.parent_id === '') {
      body.parent_id = null;
    }
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceFeatureFolder(
    datamartId: string,
    folderId: string,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders/${folderId}`;
    return ApiService.deleteRequest(endpoint);
  }

  private _fetchFolders = (datamartId: string) => {
    return this.getAudienceFeatureFolders(datamartId).then(res => {
      return res.data;
    });
  };

  fetchFoldersAndFeatures = (
    datamartId: string,
    setFoldersAndFeatures: (
      folders: AudienceFeatureFolderResource[],
      baseFeatures: AudienceFeatureResource[],
      total?: number,
      isJobExecutionExisting?: boolean,
    ) => void,
    onFailure: (err: any) => void,
    filter?: AudienceFeatureSearchSettings,
    checkJobExecutions?: boolean,
  ) => {
    const options = this.buildAudienceFeatureOptions(filter);

    const res: Array<Promise<any>> = [
      this._fetchFolders(datamartId),
      this.getAudienceFeatures(datamartId, options),
    ];
    if (checkJobExecutions) {
      res.push(this.getReferenceTableJobExecutions(datamartId));
    }
    return Promise.all(res)
      .then((results: any[]) => {
        const folders: AudienceFeatureFolderResource[] = results[0];
        const features: DataListResponse<AudienceFeatureResource> = results[1];
        const jobExecutions: DataListResponse<PublicJobExecutionResource> | undefined = results[2];
        setFoldersAndFeatures(
          folders,
          features.data,
          features.total,
          jobExecutions && jobExecutions.data
            ? jobExecutions.data.length > 0 &&
                jobExecutions.data.map(job => job.status).includes('SUCCEEDED')
            : false,
        );
      })
      .catch(err => {
        onFailure(err);
      });
  };

  buildAudienceFeatureOptions = (filter?: AudienceFeatureSearchSettings, folderId?: string) => {
    const options: AudienceFeatureOptions = {
      ...getPaginatedApiParam(filter?.currentPage, filter?.pageSize),
    };

    if (filter?.keywords) {
      options.keywords = [filter.keywords];
    } else {
      options.folder_id = folderId ? folderId : 'none';
    }
    if (filter?.finalValues) {
      options.values = [filter.finalValues];
    }
    return options;
  };

  getAudienceFeatureSegmentsMapping = (
    datamartId: string,
    audienceFeatureId: string,
  ): Promise<DataResponse<AudienceFeatureSegmentsMappingResource>> => {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}/segments_mapping`;
    return ApiService.getRequest(endpoint);
  };

  getFinalValues(
    datamartId: string,
    keywords?: string,
  ): Promise<DataResponse<ReferenceTableValue>> {
    return ApiService.getRequest(
      `datamarts/${datamartId}/reference_table_values?keywords=${keywords}`,
    );
  }

  getReferenceTableJobExecutions(
    datamartId: string,
  ): Promise<DataListResponse<PublicJobExecutionResource>> {
    return ApiService.getRequest(`datamarts/${datamartId}/reference_table_job_executions`);
  }
}
