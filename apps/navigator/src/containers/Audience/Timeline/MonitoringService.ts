import { ProcessingResource } from './../../../models/processing';
import UserChoiceResource from '../../../models/userchoice/UserChoiceResource';
import { Identifier } from './Monitoring';
import {
  isUserPointIdentifier,
  UserProfileGlobal,
  UserProfileGlobalType,
} from './../../../models/timeline/timeline';
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
  UserEmailIdentifierInfo,
  UserSegmentResource,
  UserProfilePerCompartmentAndUserAccountId,
  UserProfileResource,
  UserAccountIdentifierInfo,
  isUserAccountIdentifier,
  FormattedUserAccountCompartmentResource,
} from '../../../models/timeline/timeline';
import { IOrganisationService } from '../../../services/OrganisationService';
import { IDatamartService } from '../../../services/DatamartService';
import { UserAgentIdentifierInfo } from '@mediarithmics-private/mcs-components-library/lib/models/timeline/timeline';

export interface IMonitoringService {
  fetchProfileData: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<UserProfileGlobal>; // type it
  fetchSegmentsData: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<UserSegmentResource[]>;
  fetchCompartments: (
    datamart: DatamartResource,
  ) => Promise<UserAccountCompartmentDatamartSelectionResource[]>;
  getLastSeen: (datamart: DatamartResource, userIdentifier: Identifier) => Promise<number>;
  fetchUserAccountsByCompartmentId: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<Dictionary<UserAccountIdentifierInfo[]>>;
  fetchUserAgents: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<UserAgentIdentifierInfo[]>;
  fetchUserEmails: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<UserEmailIdentifierInfo[]>;
  fetchProcessings: (datamart: DatamartResource) => Promise<ProcessingResource[]>;
  fetchUserChoices: (
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ) => Promise<UserChoiceResource[]>;
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
  @inject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @inject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  @inject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  fetchProfileData(
    datamart: DatamartResource,
    userIdentifier: Identifier,
  ): Promise<UserProfileGlobal> {
    const emptyResponse: UserProfileGlobal = { type: undefined, profile: {} };

    return this._userDataService
      .getProfiles(datamart.id, userIdentifier)
      .then(profilesResponse => {
        if (!profilesResponse) return emptyResponse;

        if (
          profilesResponse.data.length === 1 &&
          profilesResponse.data[0].$compartment_id === undefined
        ) {
          return {
            type: 'legacy' as UserProfileGlobalType,
            profile: profilesResponse.data[0],
          };
        }

        const profileApiResponse = profilesResponse.data;

        const getUsersAccountCompartment = (profiles: UserProfileResource[]) => {
          const promises: Array<Promise<any>> = [];

          const compartmentIds = new Set();
          for (const profile of profiles) {
            if (profile.$compartment_id) compartmentIds.add(profile.$compartment_id);
          }
          compartmentIds.forEach((compartmentId: string) => {
            promises.push(
              this._datamartService.getUserAccountCompartment(compartmentId).then(compartment => {
                return compartment.data;
              }),
            );
          });
          return Promise.all(promises);
        };

        return getUsersAccountCompartment(profileApiResponse)
          .then(usersAccountCompartments => {
            const formattedUsersAccountCompartmentsResponse: FormattedUserAccountCompartmentResource =
              {};
            for (const usersAccountCompartment of usersAccountCompartments) {
              formattedUsersAccountCompartmentsResponse[usersAccountCompartment.id] =
                usersAccountCompartment;
            }

            // Default accumulator value
            const seedAcc: Promise<UserProfilePerCompartmentAndUserAccountId> = Promise.resolve({});

            const userProfilePerCompartmentAndUserAccountId = profilesResponse.data.reduce(
              (accP: UserProfilePerCompartmentAndUserAccountId, curr: UserProfileResource) => {
                const acc = accP;

                const compartmentId = curr.$compartment_id ? curr.$compartment_id : 'default';
                const userAccountId = curr.$user_account_id ? curr.$user_account_id : 'anonymous';
                const newProfile = {
                  userAccountId: userAccountId,
                  profile: curr,
                };

                if (!acc[compartmentId]) {
                  acc[compartmentId] = {
                    compartmentName:
                      formattedUsersAccountCompartmentsResponse[compartmentId].name ||
                      formattedUsersAccountCompartmentsResponse[compartmentId].token,
                    profiles: [newProfile],
                  };
                } else {
                  acc[compartmentId].profiles = acc[compartmentId].profiles.concat(newProfile);
                }

                return acc;
              },
              seedAcc,
            );

            return {
              type: 'pionus' as UserProfileGlobalType,
              profile: userProfilePerCompartmentAndUserAccountId,
            };
          })
          .catch(err => {
            return emptyResponse;
          });
      })
      .catch(() => {
        return emptyResponse;
      });
  }

  fetchSegmentsData(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getSegments(datamart.id, userIdentifier)
      .then(res => {
        return res.data;
      })
      .catch(e => {
        return [];
      });
  }

  fetchCompartments(datamart: DatamartResource) {
    return this._datamartService
      .getUserAccountCompartmentDatamartSelectionResources(datamart.id)
      .then(resp => {
        return resp.data;
      })
      .catch(e => {
        return [];
      });
  }

  getLastSeen(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getActivities(datamart.id, userIdentifier, { live: true })
      .then(res => {
        const timestamps = res.data.map(item => {
          return item.$ts;
        });
        let lastSeen = 0;
        if (timestamps.length > 0) {
          lastSeen = Math.max.apply(null, timestamps);
        }

        return lastSeen;
      })
      .catch(e => {
        return 0;
      });
  }

  fetchUserAccountsByCompartmentId(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getIdentifiers(datamart.organisation_id, datamart.id, userIdentifier.type, userIdentifier.id)
      .then(response => {
        const userAccountIdentifierInfos = response.data.filter(isUserAccountIdentifier);
        const userAccountsByCompartmentId = groupBy(userAccountIdentifierInfos, 'compartment_id');

        return userAccountsByCompartmentId;
      });
  }

  fetchUserAgents(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getIdentifiers(datamart.organisation_id, datamart.id, userIdentifier.type, userIdentifier.id)
      .then(response => {
        const userAgentsIdentifierInfo = response.data.filter(isUserAgentIdentifier);
        return userAgentsIdentifierInfo;
      });
  }

  fetchUserEmails(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getIdentifiers(datamart.organisation_id, datamart.id, userIdentifier.type, userIdentifier.id)
      .then(response => {
        const userEmailsIdentifierInfo = response.data.filter(isUserEmailIdentifier);
        return userEmailsIdentifierInfo;
      });
  }

  fetchProcessings(datamart: DatamartResource) {
    return this._organisationService
      .getOrganisation(datamart.organisation_id)
      .then(res => {
        const communityId = res.data.community_id;
        return this._organisationService
          .getProcessings(communityId, { first_result: 0, max_results: 2147483647 })
          .then(response => {
            return response.data;
          });
      })
      .catch(e => {
        return [];
      });
  }

  fetchUserChoices(datamart: DatamartResource, userIdentifier: Identifier) {
    return this._userDataService
      .getUserChoices(datamart.id, userIdentifier)
      .then(response => {
        return response.data;
      })
      .catch(e => {
        return [];
      });
  }

  fetchMonitoringDataByIdentifier(userIdentifier: Identifier, datamart: DatamartResource) {
    return Promise.all([
      this.fetchCompartments(datamart),
      this.getLastSeen(datamart, userIdentifier),
      this.fetchSegmentsData(datamart, userIdentifier),
      this.fetchProfileData(datamart, userIdentifier),
      this.fetchProcessings(datamart),
      this.fetchUserChoices(datamart, userIdentifier),
    ]);
  }

  fetchMonitoringData(
    organisationId: string,
    datamart: DatamartResource,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
  ): Promise<MonitoringData> {
    const emptyData: MonitoringData = {
      userAgentList: [],
      userEmailList: [],
      userAccountsByCompartmentId: {},
      userAccountCompartments: [],
      lastSeen: 0,
      userSegmentList: [],
      userChoices: { userChoices: [], processings: [] },
      userProfile: { type: undefined, profile: {} },
      userPointList: [],
      userIdentifier: { type: '', id: '' },
      isUserFound: false,
    };
    return this._userDataService
      .getIdentifiers(organisationId, datamart.id, identifierType, identifierId, compartmentId)
      .then(response => {
        const userPointIdentifierInfo = response.data.find(isUserPointIdentifier);
        const userAgentIdentifierInfo = response.data.find(isUserAgentIdentifier);
        const userIdentifier = userPointIdentifierInfo
          ? {
              type: 'user_point_id',
              id: userPointIdentifierInfo && userPointIdentifierInfo.user_point_id,
            }
          : {
              type: 'user_agent_id',
              id: userAgentIdentifierInfo
                ? userAgentIdentifierInfo && userAgentIdentifierInfo.vector_id
                : '',
            };

        if (userIdentifier.id) {
          return this.fetchMonitoringDataByIdentifier(userIdentifier, datamart).then(res => {
            return {
              userAgentList: response.data.filter(isUserAgentIdentifier),
              userEmailList: response.data.filter(isUserEmailIdentifier),
              userAccountsByCompartmentId: groupBy(
                response.data.filter(isUserAccountIdentifier),
                'compartment_id',
              ),
              userAccountCompartments: res[0],
              lastSeen: res[1],
              userSegmentList: res[2],
              userChoices: { userChoices: res[5], processings: res[4] },
              userProfile: res[3],
              userPointList: [],
              userIdentifier: userIdentifier,
              isUserFound: true,
            };
          });
        }
        return Promise.resolve(emptyData);
      })
      .catch(() => {
        const userIdentifier = {
          id: identifierId,
          type: identifierType,
          compartmentId: compartmentId,
        };
        return this.fetchMonitoringDataByIdentifier(userIdentifier, datamart).then(res => {
          if (res[1]) {
            return {
              userAgentList: [],
              userEmailList: [],
              userAccountsByCompartmentId: {},
              userAccountCompartments: res[0],
              lastSeen: res[1],
              userSegmentList: res[2],
              userChoices: { userChoices: res[5], processings: res[4] },
              userProfile: res[3],
              userPointList: [],
              userIdentifier: userIdentifier,
              isUserFound: true,
            };
          } else {
            return emptyData;
          }
        });
      });
  }
}
