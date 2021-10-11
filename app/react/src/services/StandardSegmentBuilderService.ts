import { StandardSegmentBuilderResource } from '../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { injectable, inject } from 'inversify';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { StandardSegmentBuilderFormData } from '../containers/Settings/DatamartSettings/StandardSegmentBuilder/Edit/domain';
import { TYPES } from '../constants/types';
import { IAudienceFeatureService } from './AudienceFeatureService';
import { createFieldArrayModelWithMeta } from '../utils/FormHelper';

export interface StandardSegmentBuilderOptions extends PaginatedApiParam {}

export interface IStandardSegmentBuilderService {
  createStandardSegmentBuilder: (
    datamartId: string,
    body: Partial<StandardSegmentBuilderResource>,
  ) => Promise<DataResponse<StandardSegmentBuilderResource>>;

  getStandardSegmentBuilders: (
    datamartId: string,
    options?: StandardSegmentBuilderOptions,
  ) => Promise<DataListResponse<StandardSegmentBuilderResource>>;

  loadStandardSegmentBuilder: (
    datamartId: string,
    segmentBuilderId: string,
  ) => Promise<StandardSegmentBuilderFormData>;

  getStandardSegmentBuilder: (
    datamartId: string,
    segmentBuilderId: string,
  ) => Promise<DataResponse<StandardSegmentBuilderResource>>;

  updateStandardSegmentBuilder: (
    datamartId: string,
    segmentBuilderId: string,
    body: Partial<StandardSegmentBuilderResource>,
  ) => Promise<DataResponse<StandardSegmentBuilderResource>>;

  deleteStandardSegmentBuilder(
    datamartId: string,
    segmentBuilderId: string,
  ): Promise<DataResponse<any>>;
}

@injectable()
export default class StandardSegmentBuilderService implements IStandardSegmentBuilderService {
  @inject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  createStandardSegmentBuilder(
    datamartId: string,
    body: Partial<StandardSegmentBuilderResource>,
  ): Promise<DataResponse<StandardSegmentBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/standard_segment_builders`;
    return ApiService.postRequest(endpoint, body);
  }

  getStandardSegmentBuilders(
    datamartId: string,
    options?: StandardSegmentBuilderOptions,
  ): Promise<DataListResponse<StandardSegmentBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/standard_segment_builders`;
    return ApiService.getRequest(endpoint, options);
  }

  getStandardSegmentBuilder(
    datamartId: string,
    segmentBuilderId: string,
  ): Promise<DataResponse<StandardSegmentBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/standard_segment_builders/${segmentBuilderId}`;
    return ApiService.getRequest(endpoint);
  }

  loadStandardSegmentBuilder(
    datamartId: string,
    segmentBuilderId: string,
  ): Promise<StandardSegmentBuilderFormData> {
    return this.getStandardSegmentBuilder(datamartId, segmentBuilderId).then(builder => {
      return Promise.all(
        builder.data.initial_audience_feature_ids.map(id => {
          return this._audienceFeatureService
            .getAudienceFeature(datamartId, id)
            .then(feature => feature.data);
        }),
      ).then(audienceFeatures => {
        return {
          standardSegmentBuilder: builder.data,
          initialAudienceFeatures: audienceFeatures.map(feature => {
            return createFieldArrayModelWithMeta(feature, { name: feature.name });
          }),
        };
      });
    });
  }

  updateStandardSegmentBuilder(
    datamartId: string,
    standardSegmentBuilderId: string,
    body: Partial<StandardSegmentBuilderResource>,
  ): Promise<DataResponse<StandardSegmentBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/standard_segment_builders/${standardSegmentBuilderId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteStandardSegmentBuilder(
    datamartId: string,
    standardSegmentBuilderId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `datamarts/${datamartId}/standard_segment_builders/${standardSegmentBuilderId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
