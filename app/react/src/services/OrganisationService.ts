import ApiService, { DataResponse } from './ApiService';
import { Workspace, Cookie } from '../models/organisation/organisation';

export default {
  getWorkspace(organisationId: string): Promise<DataResponse<Workspace>> {
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
  }

}
