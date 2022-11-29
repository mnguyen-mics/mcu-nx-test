import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { DisplayNetworkResource } from '../models/displayNetworks/DisplayNetworkResource';
import { injectable } from 'inversify';

export interface IDisplayNetworkService {
  getDisplayNetwork: (
    id: string,
    organisationId: string,
  ) => Promise<DataResponse<DisplayNetworkResource>>;
}
@injectable()
export class DisplayNetworkService implements IDisplayNetworkService {
  getDisplayNetwork = (
    id: string,
    organisationId: string,
  ): Promise<DataResponse<DisplayNetworkResource>> => {
    const endpoint = `display_networks/${id}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  };
}
