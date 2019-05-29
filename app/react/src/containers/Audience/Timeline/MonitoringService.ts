import { IUserDataService } from './../../../services/UserDataService';
import { DatamartResource } from './../../../models/datamart/DatamartResource';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import {
  isUserPointIdentifier,
  IdentifiersProps,
  isUserAgentIdentifier,
  isUserEmailIdentifier,
  UserAgentIdentifierInfo,
  UserEmailIdentifierInfo,
} from '../../../models/timeline/timeline';

export interface IMonitoringService {
  fetchUserAgents: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<UserAgentIdentifierInfo[]>;
  fetchUserEmails: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<UserEmailIdentifierInfo[]>;
  fetchMonitoringData: (
    organisationId: string,
    datamart: DatamartResource,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
  ) => Promise<IdentifiersProps>;
}

@injectable()
export class MonitoringService implements IMonitoringService {
  @inject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  fetchUserAgents = (datamart: DatamartResource, userPointId: string) => {
    const identifierType = 'user_point_id';

    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userAgentsIdentifierInfo = response.data.filter(
          isUserAgentIdentifier,
        );
        return userAgentsIdentifierInfo;
      });
  };

  fetchUserEmails = (datamart: DatamartResource, userPointId: string) => {
    const identifierType = 'user_point_id';

    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userEmailsIdentifierInfo = response.data.filter(
          isUserEmailIdentifier,
        );
        return userEmailsIdentifierInfo;
      });
  };

  fetchMonitoringData = (
    organisationId: string,
    datamart: DatamartResource,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
  ) => {
    return this._userDataService
      .getIdentifiers(
        organisationId,
        datamart.id,
        identifierType,
        identifierId,
        compartmentId,
      )
      .then(response => {
        const userPointIdentifierInfo = response.data.find(
          isUserPointIdentifier,
        );

        return userPointIdentifierInfo;
      })
      .then(userPointIdentifierInfo => {
        const userPointId =
          userPointIdentifierInfo && userPointIdentifierInfo.user_point_id;
        if (userPointId) {
          return Promise.all([
            this.fetchUserAgents(datamart, userPointId),
            this.fetchUserEmails(datamart, userPointId),
          ]).then(res => {
            const hasItems = res[0].length > 0 && res[1].length > 0;
            return {
              hasItems: hasItems,
              items: {
                USER_ACCOUNT: [],
                USER_AGENT: res[0],
                USER_EMAIL: res[1],
                USER_POINT: [],
              },
              userPointId: userPointId,
            };
          });
        }
        return Promise.resolve({
          hasItems: false,
          items: {
            USER_ACCOUNT: [],
            USER_AGENT: [],
            USER_EMAIL: [],
            USER_POINT: [],
          },
          userPointId: '',
        });
      });
  };
}
