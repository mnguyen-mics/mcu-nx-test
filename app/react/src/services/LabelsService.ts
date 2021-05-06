import { Label } from './../containers/Labels/Labels';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { injectable } from 'inversify';

export interface ILabelService {
  getLabels: (organisationId: string, options?: object) => Promise<DataListResponse<Label>>;

  updateLabel: (
    labelId: string,
    name: string,
    organisationId: string,
  ) => Promise<DataResponse<Label>>;

  createLabel: (
    name: string,
    organisationId: string,
    options?: object,
  ) => Promise<DataResponse<Label>>;

  deleteLabel: (labelId: string) => Promise<DataResponse<Label>>;

  pairLabels: (labelId: string, labelableType: string, labelableId: string) => Promise<void>;

  unPairLabels: (labelId: string, labelableType: string, labelableId: string) => Promise<void>;
}
@injectable()
export class LabelService implements ILabelService {
  getLabels(organisationId: string, options: object = {}): Promise<DataListResponse<Label>> {
    const endpoint = 'labels';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }

  updateLabel(labelId: string, name: string, organisationId: string): Promise<DataResponse<Label>> {
    const endpoint = `labels/${labelId}`;
    const body = {
      id: labelId,
      name,
      organisation_id: organisationId,
    };
    return ApiService.putRequest(endpoint, body);
  }

  createLabel(
    name: string,
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<Label>> {
    const endpoint = 'labels';
    const params = {
      name,
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.postRequest(endpoint, params);
  }

  deleteLabel(labelId: string): Promise<DataResponse<Label>> {
    const endpoint = `labels/${labelId}`;
    return ApiService.deleteRequest(endpoint);
  }

  pairLabels(labelId: string, labelableType: string, labelableId: string): Promise<void> {
    const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
    return ApiService.postRequest(endpoint, {});
  }

  unPairLabels(labelId: string, labelableType: string, labelableId: string): Promise<void> {
    const endpoint = `labels/${labelId}/links/${labelableType}/${labelableId}`;
    return ApiService.deleteRequest(endpoint, {});
  }
}
