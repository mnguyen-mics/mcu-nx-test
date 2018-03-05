
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
} from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import Error from '../../components/Error.tsx';
import AuthService from '../../services/AuthService';
import log from '../../utils/Logger';
import { getWorkspace } from '../../state/Session/actions';
import { fetchAllLabels } from '../../state/Labels/actions';
import {
  hasAccessToOrganisation,
  hasWorkspace,
} from '../../state/Session/selectors';
import errorMessages from '../Navigator/messages';

class AuthenticatedRoute extends Component {

  componentDidMount() {
    const {
      computedMatch: {
        params: { organisationId },
      },
      getWorkspaceRequest,
      getLabels,
      hasWorkspaceLoaded,
    } = this.props;

    if (!hasWorkspaceLoaded(organisationId)) {
      getWorkspaceRequest(organisationId);
    }
    getLabels(organisationId);
  }

  componentWillReceiveProps(nextProps) {

    const {
      computedMatch: {
        params: { organisationId },
      },
    } = this.props;

    const {
      computedMatch: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    // TO BE REMOVED WHEN HOME PAGE IS AVAILABLE
    if (nextOrganisationId !== organisationId) {
      window.location.href = `/v2/o/${nextOrganisationId}/campaigns/display`; // eslint-disable-line
      window.location.reload(true); // eslint-disable-line
    }

    // if (nextOrganisationId !== organisationId && !hasWorkspaceLoaded(nextOrganisationId)) {
    //   getWorkspaceRequest(nextOrganisationId);
    // }
  }

  render() {
    const {
      accessGrantedToOrganisation,
      computedMatch: {
        params: { organisationId },
      },
      connectedUserLoaded,
      intl: { formatMessage },
      render,
    } = this.props;

    const authenticated = AuthService.isAuthenticated() && connectedUserLoaded; // if access token is present in local storage and valid

    return (
      <Route
        {...this.props}
        render={props => {
          if (authenticated) {

            if (accessGrantedToOrganisation(organisationId)) {
              log.trace(`Access granted to ${props.match.url}`);
              return render(props);
            }

            return <Error message={formatMessage(errorMessages.notFound)} />;
          }
          log.error(`Access denied to ${props.match.url}, redirect to login`);
          return (<Redirect to={{ pathname: '/login', state: { from: props.location } }} />);
        }}
      />
    );
  }
}

AuthenticatedRoute.propTypes = {
  accessGrantedToOrganisation: PropTypes.func.isRequired,
  computedMatch: PropTypes.shape().isRequired,
  connectedUserLoaded: PropTypes.bool.isRequired,
  getWorkspaceRequest: PropTypes.func.isRequired,
  hasWorkspaceLoaded: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  render: PropTypes.func.isRequired,
  getLabels: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  accessGrantedToOrganisation: hasAccessToOrganisation(state),
  hasWorkspaceLoaded: hasWorkspace(state),
  connectedUserLoaded: state.session.connectedUserLoaded,
});

const mapDispatchToProps = {
  getWorkspaceRequest: getWorkspace.request,
  getLabels: fetchAllLabels.request,
};

export default compose(
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuthenticatedRoute);
