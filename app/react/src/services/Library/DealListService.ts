import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import {
  DealsListResource,
  DealResource,
} from '../../models/dealList/dealList';
import { injectable } from 'inversify';

export interface IDealListService {
  getDealLists(
    organisationId: string,
    options: object,
  ): Promise<DataListResponse<DealsListResource>>;
  getDealList(
    organisationId: string,
    dealListId: string,
  ): Promise<DataResponse<DealsListResource>>;
  createDealList(
    organisationId: string,
    dealList: Partial<DealsListResource>,
  ): Promise<DataResponse<DealsListResource>>;
  updateDealList(
    organisationId: string,
    dealListId: string,
    dealList: Partial<DealsListResource>,
  ): Promise<DataResponse<DealsListResource>>;
  deleteDealList(
    organisationId: string,
    dealListId: string,
  ): Promise<DataResponse<DealsListResource>>;
  getDeals(
    organisationId: string,
    options: object,
  ): Promise<DataListResponse<DealResource>>;
  getDeal(dealId: string): Promise<DataResponse<DealResource>>;
  createDeal(
    organisationId: string,
    dealList: Partial<DealResource>,
  ): Promise<DataResponse<DealResource>>;
  updateDeal(
    dealId: string,
    dealList: Partial<DealResource>,
  ): Promise<DataResponse<DealResource>>;
  deleteDeal(dealId: string): Promise<DataResponse<DealResource>>;
  addDealToDealList(dealListId: string, dealId: string): Promise<{}>;
  removeDealToDealList(dealListId: string, dealId: string): Promise<{}>;
}

@injectable()
export class DealListService implements IDealListService {
  //
  //  DEAL LIST
  //
  getDealLists(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DealsListResource>> {
    const endpoint = `deal_lists`;
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getDealList(
    organisationId: string,
    dealListId: string,
  ): Promise<DataResponse<DealsListResource>> {
    const endpoint = `deal_lists/${dealListId}`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  }

  createDealList(
    organisationId: string,
    dealList: Partial<DealsListResource>,
  ): Promise<DataResponse<DealsListResource>> {
    const endpoint = `deal_lists?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, dealList);
  }

  updateDealList(
    organisationId: string,
    dealListId: string,
    dealList: Partial<DealsListResource>,
  ): Promise<DataResponse<DealsListResource>> {
    const endpoint = `deal_lists/${dealListId}?organisation_id=${organisationId}`;
    return ApiService.putRequest(endpoint, dealList);
  }

  deleteDealList(
    organisationId: string,
    dealListId: string,
  ): Promise<DataResponse<DealsListResource>> {
    const endpoint = `deal_lists/${dealListId}`;
    return ApiService.deleteRequest(endpoint, {
      organisation_id: organisationId,
    });
  }

  //
  //  DEALS
  //
  getDeals(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DealResource>> {
    const endpoint = `deals`;
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getDeal(dealId: string): Promise<DataResponse<DealResource>> {
    const endpoint = `deals/${dealId}`;
    return ApiService.getRequest(endpoint);
  }

  createDeal(
    organisationId: string,
    dealList: Partial<DealResource>,
  ): Promise<DataResponse<DealResource>> {
    const endpoint = `deals?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, dealList);
  }

  updateDeal(
    dealId: string,
    dealList: Partial<DealResource>,
  ): Promise<DataResponse<DealResource>> {
    const endpoint = `deals/${dealId}`;
    return ApiService.putRequest(endpoint, dealList);
  }

  deleteDeal(dealId: string): Promise<DataResponse<DealResource>> {
    const endpoint = `deals/${dealId}`;
    return ApiService.deleteRequest(endpoint);
  }

  //
  //  DEAL LIST SELECTION
  //
  addDealToDealList(dealListId: string, dealId: string): Promise<DataResponse<DealResource>> {
    const endpoint = `deal_lists/${dealListId}/deal/${dealId}`;
    return ApiService.putRequest(endpoint, {});
  }

  removeDealToDealList(dealListId: string, dealId: string): Promise<DataResponse<DealResource>> {
    const endpoint = `deal_lists/${dealListId}/deal/${dealId}`;
    return ApiService.deleteRequest(endpoint, {});
  }
}
