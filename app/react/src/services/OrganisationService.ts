import { ProcessingResource } from './../models/processing';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { Cookie, OrganisationResource } from '../models/organisation/organisation';
import { UserWorkspaceResource } from '../models/directory/UserProfileResource';
import { BillingAccountResource } from '../models/billingAccounts/BillingAccountResource';
import { injectable } from 'inversify';

export interface IOrganisationService {
  getWorkspace: (organisationId: string) => Promise<DataResponse<UserWorkspaceResource>>;

  getCookies: () => Promise<DataResponse<Cookie>>;
  getStandardLogo: () => Promise<Blob>;
  getLogoCache: (organisationId: string) => Blob | null;
  getLogo: (organisationId: string) => Promise<Blob>;
  putLogo: (organisationId: string, formData: FormData) => Promise<any>;
  getBillingAccounts: (organisationId: string) => Promise<DataListResponse<BillingAccountResource>>;
  getOrganisation: (organisationId: string) => Promise<DataResponse<OrganisationResource>>;
  getOrganisations: (communityId: string) => Promise<DataListResponse<OrganisationResource>>;
  getProcessings: (
    communityId: string,
    filters?: object,
  ) => Promise<DataListResponse<ProcessingResource>>;
  getProcessing: (processingId: string) => Promise<DataResponse<ProcessingResource>>;
  createProcessing: (
    communityId: string,
    processingResource: ProcessingResource,
  ) => Promise<DataResponse<ProcessingResource>>;
  updateProcessing: (
    processingId: string,
    processingResource: ProcessingResource,
  ) => Promise<DataResponse<ProcessingResource>>;
  archiveProcessing: (
    communityId: string,
    processingId: string,
  ) => Promise<DataResponse<ProcessingResource>>;
  deleteProcessing: (communityId: string, processingId: string) => Promise<DataResponse<any>>;
}

@injectable()
export default class OrganisationService implements IOrganisationService {
  getWorkspace(organisationId: string): Promise<DataResponse<UserWorkspaceResource>> {
    const endpoint = `organisations/${organisationId}/workspace`;
    return ApiService.getRequest(endpoint);
  }
  getCookies(): Promise<DataResponse<Cookie>> {
    const endpoint = 'my_cookies';
    return ApiService.getRequest(endpoint, {}, {}, { withCredentials: true });
  }
  getStandardLogo(): Promise<Blob> {
    const endpoint = 'react/src/assets/images/logo.png';

    const headers = { Accept: 'image/png' };
    const options = {
      localUrl: true,
    };

    return ApiService.getRequest(endpoint, undefined, headers, options);
  }

  logoCache: { [orgId: string]: Blob } = {};
  private doGetLogo = (organisationId: string) => {
    const endpoint = `organisations/${organisationId}/logo`;
    const headers = { Accept: 'image/png' };
    return ApiService.getRequest<Blob>(endpoint, undefined, headers)
      .catch(() => this.getStandardLogo())
      .then(blobLogo => {
        this.logoCache[organisationId] = blobLogo;
        return blobLogo;
      });
  };

  getLogoCache = (organisationId: string) => {
    return this.logoCache[organisationId];
  };

  getLogo = (organisationId: string) => {
    const cachedValue = this.logoCache[organisationId];
    return cachedValue ? Promise.resolve(cachedValue) : this.doGetLogo(organisationId);
  };

  putLogo(organisationId: string, formData: FormData): Promise<any> {
    const endpoint = `organisations/${organisationId}/logo`;
    return ApiService.putRequest(endpoint, formData);
  }
  getBillingAccounts(organisationId: string): Promise<DataListResponse<BillingAccountResource>> {
    const endpoint = `billing_accounts?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
  getOrganisation(organisationId: string): Promise<DataResponse<OrganisationResource>> {
    const endpoint = `organisations/${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
  getOrganisations(communityId: string): Promise<DataListResponse<OrganisationResource>> {
    const endpoint = `organisations?community_id=${communityId}`;
    return ApiService.getRequest(endpoint);
  }
  getProcessings(
    communityId: string,
    filters: object = {},
  ): Promise<DataListResponse<ProcessingResource>> {
    const endpoint = 'processings';
    const options = {
      community_id: communityId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getProcessing(processingId: string): Promise<DataResponse<ProcessingResource>> {
    const endpoint = `processings/${processingId}`;
    return ApiService.getRequest(endpoint);
  }
  createProcessing(
    communityId: string,
    processingResource: ProcessingResource,
  ): Promise<DataResponse<ProcessingResource>> {
    const endpoint = `processings`;
    const resource = {
      ...processingResource,
      community_id: communityId,
    };
    return ApiService.postRequest(endpoint, resource);
  }
  updateProcessing(
    processingId: string,
    processingResource: ProcessingResource,
  ): Promise<DataResponse<ProcessingResource>> {
    const endpoint = `processings/${processingId}`;
    return ApiService.putRequest(endpoint, processingResource);
  }
  archiveProcessing(
    communityId: string,
    processingId: string,
  ): Promise<DataResponse<ProcessingResource>> {
    const endpoint = `processings/${processingId}`;
    const resource = { archived: true, community_id: communityId };
    return ApiService.putRequest(endpoint, resource);
  }
  deleteProcessing(communityId: string, processingId: string): Promise<DataResponse<any>> {
    const endpoint = `processings/${processingId}`;
    const options = {
      community_id: communityId,
    };
    return ApiService.deleteRequest(endpoint, options);
  }
}
