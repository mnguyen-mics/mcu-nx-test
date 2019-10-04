import { groupBy, Dictionary } from 'lodash';
import { IUserDataService } from './../../../services/UserDataService';
import {
  DatamartResource,
  UserAccountCompartmentDatamartSelectionResource,
} from './../../../models/datamart/DatamartResource';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../constants/types';
import {
  MonitoringData,
  isUserAgentIdentifier,
  isUserEmailIdentifier,
  UserAgentIdentifierInfo,
  UserEmailIdentifierInfo,
  UserSegmentResource,
  UserProfilePerCompartmentAndUserAccountId,
  UserProfileResource,
  UserAccountIdentifierInfo,
  isUserAccountIdentifier,
} from '../../../models/timeline/timeline';
import DatamartService from '../../../services/DatamartService';



export interface IMonitoringService {
  fetchProfileData: (
    datamart: DatamartResource,
    userAgentId: string,
  ) => Promise<UserProfilePerCompartmentAndUserAccountId>; // type it
  fetchSegmentsData: (
    datamart: DatamartResource,
    userAgentId: string,
  ) => Promise<UserSegmentResource[]>;
  fetchCompartments: (
    datamart: DatamartResource,
  ) => Promise<UserAccountCompartmentDatamartSelectionResource[]>;
  getLastSeen: (
    datamart: DatamartResource,
    userAgentId: string,
  ) => Promise<number>;
  fetchUserAccountsByCompartmentId: (
    datamart: DatamartResource,
    userAgentId: string,
  ) => Promise<Dictionary<UserAccountIdentifierInfo[]>>;
  fetchUserAgents: (
    datamart: DatamartResource,
    userAgentId: string,
  ) => Promise<UserAgentIdentifierInfo[]>;
  fetchUserEmails: (
    datamart: DatamartResource,
    userAgentId: string,
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

  private identifierType: string = 'user_agent_id';

  async fetchProfileData(datamart: DatamartResource, userAgentId: string): Promise<UserProfilePerCompartmentAndUserAccountId> {

    try {
      const profilesResponse = await this._userDataService.getProfiles(datamart.id, {
        id: userAgentId,
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

  fetchSegmentsData(datamart: DatamartResource, userAgentId: string) {
    return this._userDataService
      .getSegments(datamart.id, {
        id: userAgentId,
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

  getLastSeen(datamart: DatamartResource, userAgentId: string) {
    return this._userDataService
      .getActivities(datamart.id, {
        id: userAgentId,
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
    userAgentId: string,
  ) {
    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        this.identifierType,
        userAgentId,
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

  fetchUserAgents(datamart: DatamartResource, userAgentId: string) {
    const identifierType = 'user_agent_id';

    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userAgentId,
      )
      .then(response => {
        const userAgentsIdentifierInfo = response.data.filter(
          isUserAgentIdentifier,
        );
        return userAgentsIdentifierInfo;
      });
  }

  fetchUserEmails(datamart: DatamartResource, userAgentId: string) {
    return this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        this.identifierType,
        userAgentId,
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
        const userAgentIdentifierInfo = response.data.find(
          isUserAgentIdentifier,
        );

        return userAgentIdentifierInfo;
      })
      .then(userAgentIdentifierInfo => {
        const userAgentId =
          userAgentIdentifierInfo && userAgentIdentifierInfo.vector_id;
        if (userAgentId) {
          return Promise.all([
            this._userDataService.getIdentifiers(
                datamart.organisation_id,
                datamart.id,
                identifierType,
                userAgentId
              ),
            this.fetchCompartments(datamart),
            this.getLastSeen(datamart, userAgentId),
            this.fetchSegmentsData(datamart, userAgentId),
            this.fetchProfileData(datamart, userAgentId),
          ]).then(res => {
            return {
              userAgentList: res[0].data.filter(isUserAgentIdentifier),
              userEmailList: res[0].data.filter(isUserEmailIdentifier),
              userAccountsByCompartmentId: groupBy(
                res[0].data.filter(isUserAccountIdentifier),
                'compartment_id',
              ),
              userAccountCompartments: res[1],
              lastSeen: res[2],
              userSegmentList: res[3],
              profileByCompartmentsAndUserAccountId: res[4],
              userPointList: [],
              userAgentId: userAgentId,
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
          userAgentId: '',
        });
      });
  }
}
