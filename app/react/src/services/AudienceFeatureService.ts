import { AudienceFeatureFolderResource } from './../models/audienceFeature/AudienceFeatureResource';
import { AudienceFeatureResource } from '../models/audienceFeature';
import { injectable } from 'inversify';
import { PaginatedApiParam } from '../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';

export interface AudienceFeatureOptions extends PaginatedApiParam {
  keywords?: string[];
  exclude?: string[];
  folder_id?: string;
  // Fake variable to remove once MICS-7800 is in production
  fake_dataset?: boolean;
}

export interface IAudienceFeatureService {
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

  getAudienceFeatureChildFolders: (
    datamartId: string,
    parentId: string,
  ) => Promise<DataListResponse<AudienceFeatureFolderResource>>;
}

@injectable()
export class AudienceFeatureService implements IAudienceFeatureService {
  getAudienceFeatures(
    datamartId: string,
    options?: AudienceFeatureOptions,
  ): Promise<DataListResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features`;
    if (!!options?.fake_dataset) {
      return Promise.resolve({
        status: 'ok',
        data: [
          {
            id: '11',
            name: 'Audience Feature 11',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '12',
            name: 'Audience Feature 12',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '21',
            name: 'Audience Feature 21',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '22',
            name: 'Audience Feature 22',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [
              {
                field_name: 'creation_ts',
                parameter_name: 'creation_ts',
                path: [''],
                type: 'String',
              },
              {
                field_name: 'marital_situation',
                parameter_name: 'marital_situation',
                path: [''],
                type: 'String',
              },
            ],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '23',
            name: 'Audience Feature 23',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '31',
            name: 'Audience Feature 31',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          // Audience features in sub folders
          {
            id: '41',
            name: 'Audience Feature 41',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '42',
            name: 'Audience Feature 42',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '43',
            name: 'Audience Feature 43',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '51',
            name: 'Audience Feature 51',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '52',
            name: 'Audience Feature 52',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '61',
            name: 'Audience Feature 61',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '62',
            name: 'Audience Feature 62',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '63',
            name: 'Audience Feature 63',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '71',
            name: 'Audience Feature 71',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '72',
            name: 'Audience Feature 72',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '81',
            name: 'Audience Feature 81',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '91',
            name: 'Audience Feature 91',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '101',
            name: 'Audience Feature 101',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '102',
            name: 'Audience Feature 102',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '111',
            name: 'Audience Feature 111',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '112',
            name: 'Audience Feature 112',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
          {
            id: '113',
            name: 'Audience Feature 113',
            datamart_id: '1',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus',
            token: 'string',
            addressable_object: 'string',
            object_tree_expression: 'string',
            variables: [],
            audienceFeatureFolderId: 'string',
          },
        ],
        count: 2,
      });
    }
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
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceFeature(
    datamartId: string,
    audienceFeatureId: string,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}`;
    return ApiService.deleteRequest(endpoint);
  }

  // Folders

  getAudienceFeatureFolders(
    datamartId: string,
  ): Promise<DataListResponse<AudienceFeatureFolderResource>> {
    // const endpoint = `datamarts/${datamartId}/audience_feature_folders`;
    // return ApiService.getRequest(endpoint);

    return Promise.resolve({
      status: 'ok',
      data: [
        // first level
        {
          id: '1',
          name: 'Demographics',
          datamart_id: '1',
          audience_feature_ids: ['11', '12'],
          parent_id: '0',
          children_ids: ['4', '5'],
        },
        {
          id: '2',
          name: 'Intents',
          datamart_id: '1',
          audience_feature_ids: ['21', '22'],
          parent_id: '0',
          children_ids: ['6', '7', '8'],
        },
        {
          id: '3',
          name: 'Interests',
          datamart_id: '1',
          audience_feature_ids: ['31', '32'],
          parent_id: '0',
          children_ids: ['9', '10', '11'],
        },
        // sub folders Demographics
        {
          id: '4',
          name: 'Sub Folder Demographics 1',
          datamart_id: '1',
          audience_feature_ids: ['41', '42', '43'],
          parent_id: '1',
          children_ids: [],
        },
        {
          id: '5',
          name: 'Sub Folder Demographics 2',
          datamart_id: '1',
          audience_feature_ids: ['51', '52'],
          parent_id: '1',
          children_ids: [],
        },
        // sub folders Intents
        {
          id: '6',
          name: 'Sub Folder Intents 1',
          datamart_id: '1',
          audience_feature_ids: ['61', '62', '63'],
          parent_id: '2',
          children_ids: [],
        },
        {
          id: '7',
          name: 'Sub Folder Intents 2',
          datamart_id: '1',
          audience_feature_ids: ['71', '72'],
          parent_id: '2',
          children_ids: [],
        },
        {
          id: '8',
          name: 'Sub Folder Intents 3',
          datamart_id: '1',
          audience_feature_ids: ['81'],
          parent_id: '2',
          children_ids: [],
        },
        // sub folders Interests
        {
          id: '9',
          name: 'Sub Folder Interests 1',
          datamart_id: '1',
          audience_feature_ids: ['91'],
          parent_id: '3',
          children_ids: [],
        },
        {
          id: '10',
          name: 'Sub Folder Interests 2',
          datamart_id: '1',
          audience_feature_ids: ['101', '102'],
          parent_id: '3',
          children_ids: [],
        },
        {
          id: '11',
          name: 'Sub Folder Interests 3',
          datamart_id: '1',
          audience_feature_ids: ['111', '112', '113'],
          parent_id: '3',
          children_ids: [],
        },
      ],
      count: 3,
    });
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
    const endpoint = `datamarts/${datamartId}/audience_feature_folder/${folderId}`;
    return ApiService.getRequest(endpoint);
  }

  updateAudienceFeatureFolder(
    datamartId: string,
    folderId: string,
    body: Partial<AudienceFeatureFolderResource>,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folder/${folderId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceFeatureFolder(
    datamartId: string,
    folderId: string,
  ): Promise<DataResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folder/${folderId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getAudienceFeatureChildFolders(
    datamartId: string,
    parentId: string,
  ): Promise<DataListResponse<AudienceFeatureFolderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_feature_folders`;
    return ApiService.getRequest(endpoint, { parent: parentId });
  }
}
