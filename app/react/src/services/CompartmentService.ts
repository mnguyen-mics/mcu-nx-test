import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { UserAccountCompartmentResource } from '../models/datamart/DatamartResource';


const CompartmentService = {
  getCompartments(
    organisationId: string,
  ): Promise<DataListResponse<UserAccountCompartmentResource>> {
    return ApiService.getRequest(
      `user_account_compartments/?organisation_id=${organisationId}`,
    );
  },
  getCompartment(
    userAccountCompartment: string,
  ): Promise<DataResponse<UserAccountCompartmentResource>> {
    return ApiService.getRequest(
      `user_account_compartments/${userAccountCompartment}`,
    );
  },
};
  
export default CompartmentService;