import { groupBy, Dictionary } from 'lodash';
import { IUserDataService } from './../../../services/UserDataService';
import {
  DatamartResource,
  UserAccountCompartmentDatamartSelectionResource,
} from './../../../models/datamart/DatamartResource';
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
  UserSegmentResource,
  UserProfilePerCompartmentAndUserAccountId,
  UserProfileResource,
} from '../../../models/timeline/timeline';
import DatamartService from '../../../services/DatamartService';

export interface IMonitoringService {
  fetchProfileData: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<UserProfilePerCompartmentAndUserAccountId>; // type it
  fetchSegmentsData: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<UserSegmentResource[]>;
  fetchCompartments: (
    datamart: DatamartResource,
  ) => Promise<UserAccountCompartmentDatamartSelectionResource[]>;
  getLastSeen: (
    datamart: DatamartResource,
    userPointId: string,
  ) => Promise<number>;
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

  private identifierType: string = 'user_point_id';

  async fetchProfileData(datamart: DatamartResource, userPointId: string): Promise<UserProfilePerCompartmentAndUserAccountId> {

    try {
      const profilesResponse = await this._userDataService.getProfiles(datamart.id, {
        id: userPointId,
        type: this.identifierType
      });

      if (!profilesResponse) return {};

      // Default accumulator value
      const seedAcc: Promise<UserProfilePerCompartmentAndUserAccountId> = Promise.resolve({});

      // Async reducing
      const userProfilePerCompartmentAndUserAccountId = await profilesResponse.data.reduce(async (accP: Promise<UserProfilePerCompartmentAndUserAccountId>, curr: UserProfileResource) => {

        const acc = await accP;

        const compartmentId = curr.compartment_id ? curr.compartment_id : 'default';
        const userAccountId = curr.user_account_id ? curr.user_account_id : 'anonymous';
        const newProfile = {
          userAccountId: userAccountId,
          profile: curr
        };

        if(!acc[compartmentId]) {

          // TO DO: inject DatamartService 
          const compartment = await DatamartService.getUserAccountCompartment(compartmentId);

          acc[compartmentId] = {
            compartmentName: compartment.data.name ? compartment.data.name : compartment.data.token,
            profiles: [newProfile]
          }
        } else {
          acc[compartmentId].profiles = acc[compartmentId].profiles.concat(newProfile);
        }

        return acc;
      }, seedAcc);

      return userProfilePerCompartmentAndUserAccountId;

    } catch (e) {
      return {};
    }

  }

  fetchSegmentsData(datamart: DatamartResource, userPointId: string) {
    return this._userDataService
      .getSegments(datamart.id, {
        id: userPointId,
        type: this.identifierType,
      })
      .then(res => {
        return res.data;
      });
  }

  fetchCompartments(datamart: DatamartResource) {
    // TO DO: inject DatamartService
    return DatamartService.getUserAccountCompartments(datamart.id).then(
      resp => {
        return resp.data;
      },
    );
  }

  getLastSeen(datamart: DatamartResource, userPointId: string) {
    return this._userDataService
      .getActivities(datamart.id, {
        id: userPointId,
        type: this.identifierType,
      })
      .then(res => {
        const timestamps = res.data.map(item => {
          return item.$ts;
        });
        let lastSeen = 0;
        if (timestamps.length > 0) {
          lastSeen = Math.max.apply(null, timestamps);
        }

        return lastSeen;
      });
  }

  fetchUserAccountsByCompartmentId(
    datamart: DatamartResource,
    userPointId: string,
  ) {
    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        this.identifierType,
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
    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        this.identifierType,
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
            this.getLastSeen(datamart, userPointId),
            this.fetchSegmentsData(datamart, userPointId),
            this.fetchProfileData(datamart, userPointId),
          ]).then(res => {
            return {
              userAgentList: res[0],
              userEmailList: res[1],
              userAccountsByCompartmentId: res[2],
              userAccountCompartments: res[3],
              lastSeen: res[4],
              userSegmentList: res[5],
              profileByCompartmentsAndUserAccountId: res[6],
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
          lastSeen: 0,
          userSegmentList: [],
          profileByCompartmentsAndUserAccountId: {},
          userPointList: [],
          userPointId: '',
        });
      });
  }
}
