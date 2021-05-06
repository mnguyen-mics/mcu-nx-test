import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { UserAccountCompartmentResource } from '../models/datamart/DatamartResource';
import { injectable } from 'inversify';

export interface IComparmentService {
  getCompartments: (
    organisationId?: string,
  ) => Promise<DataListResponse<UserAccountCompartmentResource>>;

  getCompartment: (
    userAccountCompartment: string,
  ) => Promise<DataResponse<UserAccountCompartmentResource>>;
}

@injectable()
export default class CompartmentService implements IComparmentService {
  getCompartments(
    organisationId: string,
  ): Promise<DataListResponse<UserAccountCompartmentResource>> {
    return ApiService.getRequest(`user_account_compartments/?organisation_id=${organisationId}`);
  }

  getCompartment(
    userAccountCompartment: string,
  ): Promise<DataResponse<UserAccountCompartmentResource>> {
    return ApiService.getRequest(`user_account_compartments/${userAccountCompartment}`);
  }
}
