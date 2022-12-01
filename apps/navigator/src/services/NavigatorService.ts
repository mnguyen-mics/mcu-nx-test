import { ApiService } from '@mediarithmics-private/advanced-components';
import { injectable } from 'inversify';

interface Version {
  version: string;
}

export interface INavigatorService {
  getVersion: () => Promise<Version>;
  isAdBlockOn: () => Promise<void>;
}

@injectable()
export class NavigatorService implements INavigatorService {
  getVersion: () => Promise<Version> = () => {
    const endpoint = 'assets/version.json';
    const options = {
      localUrl: true,
    };
    return ApiService.getRequest(endpoint, {}, {}, options);
  };

  isAdBlockOn: () => Promise<void> = () => {
    const endpoint = 'assets/ads.html';
    const options = {
      localUrl: true,
    };

    return ApiService.getRequest(endpoint, {}, {}, options);
  };
}
