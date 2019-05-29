import { groupBy, Dictionary } from 'lodash';
import { IUserDataService } from './../../../services/UserDataService';
import { DatamartResource } from './../../../models/datamart/DatamartResource';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import {
  isUserPointIdentifier,
  MonitoringData,
  isUserAgentIdentifier,
  isUserEmailIdentifier,
  UserAgentIdentifierInfo,
  UserEmailIdentifierInfo,
  isUserAccountIdentifier,
  UserAccountIdentifierInfo,
} from '../../../models/timeline/timeline';
import DatamartService from '../../../services/DatamartService';

export interface IMonitoringService {
  fetchUserAccountsByCompartmentId: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<Dictionary<UserAccountIdentifierInfo[]>>;
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
  ) => Promise<MonitoringData>;
}

@injectable()
export class MonitoringService implements IMonitoringService {
  @inject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  fetchCompartments = (datamart: DatamartResource) => {
    // TO DO: inject DatamartService
    return DatamartService.getUserAccountCompartments(datamart.id).then(
      resp => {
        return resp.data;
      },
    );
  };

  fetchUserAccountsByCompartmentId(
    datamart: DatamartResource,
    userPointId: string,
  ) {
    const identifierType = 'user_point_id';

    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userAccountIdentifierInfos = response.data.filter(
          isUserAccountIdentifier,
        );

        const userAccountsByCompartmentId = groupBy(
          userAccountIdentifierInfos,
          'compartment_id',
        );

        return userAccountsByCompartmentId;
      });
  }

  fetchUserAgents(datamart: DatamartResource, userPointId: string) {
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
  }

  fetchUserEmails(datamart: DatamartResource, userPointId: string) {
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
  }

  fetchMonitoringData(
    organisationId: string,
    datamart: DatamartResource,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
  ) {
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
            this.fetchUserAccountsByCompartmentId(datamart, userPointId),
            this.fetchCompartments(datamart),
          ]).then(res => {
            return {
              userAgentList: res[0],
              userEmailList: res[1],
              userAccountsByCompartmentId: res[2],
              userAccountCompartments: res[3],
              userPointList: [],
              userPointId: userPointId,
            };
          });
        }
        return Promise.resolve({
          userAgentList: [],
          userEmailList: [],
          userAccountsByCompartmentId: {},
          userAccountCompartments: [],
          userPointList: [],
          userPointId: '',
        });
      });
  }
}
