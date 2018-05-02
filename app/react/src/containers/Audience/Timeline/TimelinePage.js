import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import lodash from 'lodash';
import moment from 'moment';
import { getDefaultDatamart } from '../../../state/Session/selectors';

import * as actions from '../../../state/Notifications/actions';
import Monitoring from './Monitoring.tsx';

import UserDataService from '../../../services/UserDataService.ts';
import initialState from './initialState';

class TimelinePage extends Component {

  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState);
  }

  componentDidMount() {
    const {
      defaultDatamart,
      history,
      match: {
        params: {
          organisationId,
          identifierType,
          identifierId,
        },
      },
      cookies,
      isFechingCookies,
    } = this.props;

    if ((identifierType === undefined || identifierId === undefined) && (cookies.mics_vid || cookies.mics_uaid)) {
      if (cookies.mics_vid) {
        history.push(`/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${cookies.mics_vid}`);
      }
    } else if ((identifierType === undefined || identifierId === undefined) && (cookies.mics_vid === '' || cookies.mics_uaid === '') && (isFechingCookies === false)) {
      // TODO HANDLE NO DATA FOR THIS USER
    } else if ((identifierType === undefined || identifierId === undefined) && (cookies.mics_vid === '' || cookies.mics_uaid === '') && (isFechingCookies === true)) {
      // TODO HANDLE NO DATA FOR THIS USER
    } else {
      this.fetchAllData(organisationId, defaultDatamart(organisationId).id, identifierType, identifierId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      defaultDatamart,
      match: {
        params: {
          organisationId,
          identifierType,
          identifierId,
        },
      },
      history,
      cookies,
    } = this.props;

    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          identifierType: nextIdentifierType,
          identifierId: nextIdentifierId,
        },
      },
    } = nextProps;

    if ((nextIdentifierType === undefined || nextIdentifierId === undefined) && (cookies.mics_vid || cookies.mics_uaid)) {
      if (cookies.mics_vid) {
        history.push(`/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${cookies.mics_vid}`);
      }
    } else if ((organisationId !== nextOrganisationId) || (identifierType !== nextIdentifierType) || (identifierId !== nextIdentifierId)) {
      const cb = () => this.fetchAllData(organisationId, defaultDatamart(nextOrganisationId).id, nextIdentifierType, nextIdentifierId);
      this.resetTimelineData(cb());
    }

  }

  resetTimelineData = (cb) => {
    this.setState(prevState => {
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
    }, () => { return cb; });
  }

  groupByDate = (array, key) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD');
    });
  }

  fetchProfileData = (organisationId, datamartId, identifierType, identifierId) => {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
        profile: {
          ...prevState.profile,
          isLoading: true,
        },
      };
      return nextState;
    }, () => UserDataService.getProfile(organisationId, datamartId, identifierType, identifierId)
      .then((response) => {
        this.setState((prevState) => {
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
      .catch((err) => {
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
      }));

  }

  fetchSegmentsData = (organisationId, datamartId, identifierType, identifierId) => {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
        segments: {
          ...prevState.segments,
          isLoading: true,
        },
      };
      nextState.segments.isLoading = true;
      return nextState;
    }, () => UserDataService.getSegments(organisationId, datamartId, identifierType, identifierId)
      .then((response) => {
        this.setState((prevState) => {
          const nextState = {
            ...prevState,
          };
          nextState.segments.isLoading = false;
          nextState.segments.hasItems = response.data.length > 0 ? true : false;
          nextState.segments.items = response.data;
          return nextState;
        });
      }).catch((err) => {
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
      }));
  }

  fetchIdentifiersData = (organisationId, datamartId, identifierType, identifierId) => {
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
        identifiers: {
          ...prevState.identifiers,
          isLoading: true,
        },
      };
      return nextState;
    }, () => UserDataService.getIdentifiers(organisationId, datamartId, identifierType, identifierId)
      .then((response) => {
        this.setState((prevState) => {
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

      }).catch((err) => {
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
      }));

  }

  fetchActivitiesData = (organisationId, datamartId, identifierType, identifierId, to = null) => {
    const params = to ? { live: true, limit: 10, to: to } : { live: true, limit: 10 };
    this.setState((prevState) => {
      const nextState = {
        ...prevState,
        activities: {
          ...prevState.activities,
          isLoading: true,
        },
      };
      return nextState;
    }, () => UserDataService.getActivities(organisationId, datamartId, identifierType, identifierId, params)
      .then((response) => {
        this.setState((prevState) => {
          const nextState = {
            ...prevState,
            activities: {
              ...prevState.activities,
              isLoading: false,
              hasItems: response.data.length === 10,
              items: prevState.activities.items.concat(response.data),
              byDay: this.groupByDate(prevState.activities.items.concat(response.data), '$ts'),
              nextDate: response.data.length > 10 ? moment(response.data[response.data.length - 1].$ts).format('YYYY-MM-DD') : null,
              fetchNewActivities: (e) => { e.preventDefault(); this.fetchActivitiesData(organisationId, datamartId, identifierType, identifierId, moment(response.data[response.data.length - 1].$ts).format('YYYY-MM-DD')); },
            },
          };
          return nextState;
        });
      }).catch((err) => {
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
      }));
  }

  fetchAllData = (organisationId, datamartId, identifierType, identifierId) => {
    if (identifierType === 'user_point_id' || identifierType === 'user_account_id' || identifierType === 'email_hash' || identifierType === 'user_agent_id') {
      this.fetchProfileData(organisationId, datamartId, identifierType, identifierId);
      this.fetchSegmentsData(organisationId, datamartId, identifierType, identifierId);
      this.fetchIdentifiersData(organisationId, datamartId, identifierType, identifierId);
      this.fetchActivitiesData(organisationId, datamartId, identifierType, identifierId);
    } else {
      // TODO error handling
    }

  }

  render() {
    const {
      identifiers,
      profile,
      activities,
      segments,
    } = this.state;

    const {
      defaultDatamart,
      match: {
        params: {
          organisationId,
        },
      },
      cookies,
    } = this.props;

    return (<Monitoring cookies={cookies} identifiers={identifiers} profile={profile} activities={activities} segments={segments} datamartId={defaultDatamart(organisationId).id} />);
  }
}

TimelinePage.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDatamart: PropTypes.func.isRequired,
  cookies: PropTypes.shape({
    mics_lts: PropTypes.string,
    mics_uaid: PropTypes.string,
    mics_vid: PropTypes.string,
  }).isRequired,
  notifyError: PropTypes.func.isRequired,
  isFechingCookies: PropTypes.bool.isRequired,
};

TimelinePage = compose(
  injectIntl,
  withRouter,
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
      cookies: state.session.cookies,
      isFechingCookies: state.session.isFechingCookies,
    }),
    { notifyError: actions.notifyError },
  ),
)(TimelinePage);

export default TimelinePage;
