import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { Cookie, OrganisationResource } from '../models/organisation/organisation';
import { UserWorkspaceResource } from '../models/directory/UserProfileResource';
import { BillingAccountResource } from '../models/billingAccounts/BillingAccountResource';

export default {
  getWorkspace(organisationId: string): Promise<DataResponse<UserWorkspaceResource>> {
    const endpoint = `organisations/${organisationId}/workspace`;
    return ApiService.getRequest(endpoint);
  },
  getCookies(): Promise<DataResponse<Cookie>> {
    const endpoint = 'my_cookies';
    return ApiService.getRequest(endpoint, {}, {}, { withCredentials: true });
  },
  getStandardLogo(): Promise<Blob> {
    const endpoint = 'react/src/assets/images/logo.png';
  
    const headers = { Accept: 'image/png' };
    const options = {
      localUrl: true,
    };
  
    return ApiService.getRequest(endpoint, undefined, headers, options);
  },
  getLogo(organisationId: string): Promise<Blob> {
    const endpoint = `organisations/${organisationId}/logo`;
  
    const headers = { Accept: 'image/png' };
  
    return ApiService.getRequest(endpoint, undefined, headers);
  },
  putLogo(organisationId: string, formData: FormData): Promise<any> {
    const endpoint = `organisations/${organisationId}/logo`;
    return ApiService.putRequest(endpoint, formData);
  },
  getBillingAccounts(organisationId: string): Promise<DataListResponse<BillingAccountResource>> {
    const endpoint = `billing_accounts?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  },
  getOrganisation(organisationId: string): Promise<DataResponse<OrganisationResource>> {
    const endpoint = `organisations/${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
}
