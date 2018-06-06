import * as React from 'react';
import { Icon } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import lodash from 'lodash';
import moment from 'moment';
import {
  getDefaultDatamart,
  getWorkspace,
} from '../../../state/Session/selectors';
import Monitoring, { Activities } from './Monitoring';
import UserDataService from '../../../services/UserDataService';
import initialState from './initialState';
import { takeLatest } from '../../../utils/ApiHelper';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  IdentifiersProps,
  UserSegmentResource,
  Cookies,
} from '../../../models/timeline/timeline';
import MultiSelect from '../../../components/MultiSelect';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';

const takeLatestActivities = takeLatest(UserDataService.getActivities);

interface TimelinePageParams {
  organisationId: string;
  identifierType: string;
  identifierId: string;
}

interface MapStateToProps {
  isFechingCookies: boolean;
  cookies: Cookies;
  defaultDatamart: (organisatioonId: string) => DatamartResource;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface State {
  segments: {
    isLoading: boolean;
    hasItems: boolean;
    items: UserSegmentResource[];
  };
  activities: Activities;
  identifiers: IdentifiersProps;
  profile: {
    isLoading: boolean;
    hasItems: boolean;
    items: object; // type better
  };
  selectedDatamartId: string;
}

type JoinedProps = MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<TimelinePageParams>;

class TimelinePage extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      profile: {
        isLoading: false,
        hasItems: false,
        items: {},
      },
      segments: {
        isLoading: false,
        hasItems: false,
        items: [],
      },
      activities: {
        isLoading: false,
        hasItems: false,
        items: [],
        byDay: {},
      },
      identifiers: {
        isLoading: false,
        hasItems: false,
        items: {
          USER_ACCOUNT: [],
          USER_AGENT: [],
          USER_EMAIL: [],
          USER_POINT: [],
        },
      },
      selectedDatamartId: props.defaultDatamart(
        props.match.params.organisationId,
      ).id,
    };
  }

  componentDidMount() {
    const {
      history,
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      cookies,
      isFechingCookies,
    } = this.props;
    const { selectedDatamartId } = this.state;
    if (
      (identifierType === undefined || identifierId === undefined) &&
      (cookies.mics_vid || cookies.mics_uaid)
    ) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
            cookies.mics_vid
          }`,
        );
      }
    } else if (
      (identifierType === undefined || identifierId === undefined) &&
      (cookies.mics_vid === '' || cookies.mics_uaid === '') &&
      isFechingCookies === false
    ) {
      // TODO HANDLE NO DATA FOR THIS USER
    } else if (
      (identifierType === undefined || identifierId === undefined) &&
      (cookies.mics_vid === '' || cookies.mics_uaid === '') &&
      isFechingCookies === true
    ) {
      // TODO HANDLE NO DATA FOR THIS USER
    } else {
      this.fetchAllData(
        organisationId,
        selectedDatamartId,
        identifierType,
        identifierId,
      );
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: {
        params: { organisationId, identifierType, identifierId },
      },
      history,
      cookies,
    } = this.props;

    const { selectedDatamartId } = this.state;

    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          identifierType: nextIdentifierType,
          identifierId: nextIdentifierId,
        },
      },
    } = nextProps;

    if (
      (nextIdentifierType === undefined || nextIdentifierId === undefined) &&
      (cookies.mics_vid || cookies.mics_uaid)
    ) {
      if (cookies.mics_vid) {
        history.push(
          `/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${
            cookies.mics_vid
          }`,
        );
      }
    } else if (
      organisationId !== nextOrganisationId ||
      identifierType !== nextIdentifierType ||
      decodeURIComponent(identifierId) !== decodeURIComponent(nextIdentifierId)
    ) {
      const cb = () =>
        this.fetchAllData(
          organisationId,
          selectedDatamartId,
          nextIdentifierType,
          nextIdentifierId,
        );
      this.resetTimelineData(cb());
    }
  }

  resetTimelineData = (cb: any) => {
    this.setState(
      prevState => {
        const nextState = {
          ...prevState,
          activities: {
            ...initialState.activities,
          },
          identifiers: {
            ...initialState.identifiers,
          },
          profile: {
            ...initialState.profile,
          },
          segments: {
            ...initialState.segments,
          },
        };
        return nextState;
      },
      () => {
        return cb;
      },
    );
  };

  groupByDate = (array: any[], key: any) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD');
    });
  };

  fetchProfileData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    this.setState(
      prevState => {
        const nextState = {
          ...prevState,
          profile: {
            ...prevState.profile,
            isLoading: true,
          },
        };
        return nextState;
      },
      () =>
        UserDataService.getProfile(
          organisationId,
          datamartId,
          identifierType,
          identifierId,
        )
          .then(response => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
                profile: {
                  ...prevState.profile,
                  isLoading: false,
                  hasItems: Object.keys(response.data).length > 0,
                  items: response.data,
                },
              };
              return nextState;
            });
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState(prevState => {
              const nextState = {
                ...prevState,
                profile: {
                  ...initialState.profile,
                  isLoading: false,
                  hasItems: false,
                },
              };
              return nextState;
            });
          }),
    );
  };

  fetchSegmentsData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    this.setState(
      prevState => {
        const nextState = {
          ...prevState,
          segments: {
            ...prevState.segments,
            isLoading: true,
          },
        };
        nextState.segments.isLoading = true;
        return nextState;
      },
      () =>
        UserDataService.getSegments(
          organisationId,
          datamartId,
          identifierType,
          identifierId,
        )
          .then(response => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.segments.isLoading = false;
              nextState.segments.hasItems =
                response.data.length > 0 ? true : false;
              nextState.segments.items = response.data;
              return nextState;
            });
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState(prevState => {
              const nextState = {
                ...prevState,
                segments: {
                  ...initialState.segments,
                  isLoading: false,
                  hasItems: false,
                },
              };
              return nextState;
            });
          }),
    );
  };

  fetchIdentifiersData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    this.setState(
      (prevState: any) => {
        const nextState = {
          ...prevState,
          identifiers: {
            ...prevState.identifiers,
            isLoading: true,
          },
        };
        return nextState;
      },
      () =>
        UserDataService.getIdentifiers(
          organisationId,
          datamartId,
          identifierType,
          identifierId,
        )
          .then(response => {
            this.setState((prevState: any) => {
              const nextState = {
                ...prevState,
                identifiers: {
                  ...prevState.identifiers,
                  isLoading: false,
                  hasItems: Object.keys(response.data).length > 0,
                  items: lodash.groupBy(response.data, 'type'),
                },
              };
              return nextState;
            });
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState(prevState => {
              const nextState = {
                ...prevState,
                identifiers: {
                  ...initialState.identifiers,
                  hasItems: false,
                  isLoading: false,
                },
              };
              return nextState;
            });
          }),
    );
  };

  fetchActivitiesData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    to: string = '',
  ) => {
    const params = to
      ? { live: true, limit: 10, to: to }
      : { live: true, limit: 10 };
    this.setState(
      (prevState: any) => {
        const nextState = {
          ...prevState,
          activities: {
            ...prevState.activities,
            isLoading: true,
          },
        };
        return nextState;
      },
      () =>
        takeLatestActivities(
          organisationId,
          datamartId,
          identifierType,
          identifierId,
          params,
        )
          .then((response: any) => {
            this.setState((prevState: any) => {
              const nextState = {
                ...prevState,
                activities: {
                  ...prevState.activities,
                  isLoading: false,
                  hasItems: response.data.length === 10,
                  items: prevState.activities.items.concat(response.data),
                  byDay: this.groupByDate(
                    prevState.activities.items.concat(response.data),
                    '$ts',
                  ),
                  nextDate:
                    response.data.length > 10
                      ? moment(
                          response.data[response.data.length - 1].$ts,
                        ).format('YYYY-MM-DD')
                      : null,
                  fetchNewActivities: (e: any) => {
                    e.preventDefault();
                    this.fetchActivitiesData(
                      organisationId,
                      datamartId,
                      identifierType,
                      identifierId,
                      moment(
                        response.data[response.data.length - 1].$ts,
                      ).format('YYYY-MM-DD'),
                    );
                  },
                },
              };
              return nextState;
            });
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState(prevState => {
              const nextState = {
                ...prevState,
                activities: {
                  ...initialState.activities,
                  hasItems: false,
                  isLoading: false,
                },
              };
              return nextState;
            });
          }),
    );
  };

  fetchAllData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
  ) => {
    if (
      identifierType === 'user_point_id' ||
      identifierType === 'user_account_id' ||
      identifierType === 'email_hash' ||
      identifierType === 'user_agent_id'
    ) {
      this.fetchProfileData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
      this.fetchSegmentsData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
      this.fetchIdentifiersData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
      this.fetchActivitiesData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
    } else {
      // TODO error handling
    }
  };

  renderDatamartFilter = () => {
    const {
      workspace,
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      defaultDatamart,
    } = this.props;
    const { selectedDatamartId } = this.state;
    if (workspace(organisationId).datamarts.length > 1) {
      const datamartItems = workspace(organisationId).datamarts.map(d => ({
        key: d.id,
        value: d.name || d.token,
      }));
      const filterOptions = {
        displayElement: (
          <div>
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: [
          datamartItems.find(
            di => di.key === defaultDatamart(organisationId).id,
          ),
        ],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          if (datamartItem.key !== selectedDatamartId) {
            this.setState(
              {
                selectedDatamartId: datamartItem.key,
              },
              () => {
                if (identifierId && identifierType) {
                  this.fetchAllData(
                    organisationId,
                    selectedDatamartId,
                    identifierType,
                    identifierId,
                  );
                }
              },
            );
          }
        },
      };
      return (
        <MultiSelect {...filterOptions} buttonClass="mcs-table-filters-item" />
      );
    }
    return;
  };

  render() {
    const {
      identifiers,
      profile,
      activities,
      segments,
      selectedDatamartId,
    } = this.state;
    return (
      <Monitoring
        identifiers={identifiers}
        profile={profile}
        activities={activities}
        segments={segments}
        datamartId={selectedDatamartId}
        filter={this.renderDatamartFilter()}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  cookies: state.session.cookies,
  isFechingCookies: state.session.isFechingCookies,
  defaultDatamart: getDefaultDatamart(state),
  workspace: getWorkspace(state),
});

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(TimelinePage);
