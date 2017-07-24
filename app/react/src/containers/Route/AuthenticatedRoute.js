
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Route,
  Redirect
} from 'react-router-dom';

import { NotFound } from '../../components/NotFound';
import AuthService from '../../services/AuthService';
import log from '../../utils/Logger';
import { getWorkspace } from '../../state/Session/actions';
import {
  hasAccessToOrganisation,
  hasWorkspace
 } from '../../state/Session/selectors';

class AuthenticatedRoute extends Component {

  componentDidMount() {
    const {
      computedMatch: {
        params: { organisationId }
      },
      getWorkspaceRequest,
      hasWorkspaceLoaded
    } = this.props;

    if (!hasWorkspaceLoaded(organisationId)) {
      getWorkspaceRequest(organisationId);
    }
  }

  componentWillReceiveProps(nextProps) {

    const {
      computedMatch: {
        params: { organisationId }
      }
    } = this.props;

    const {
      computedMatch: {
        params: { organisationId: nextOrganisationId }
      }
    } = nextProps;

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
      render,
      computedMatch: {
        params: { organisationId }
      },
      accessGrantedToOrganisation,
      connectedUserLoaded
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

            return <NotFound />;
          }
          log.error(`Access denied to ${props.match.url}, redirect to login`);
          return (<Redirect to={{ pathname: '/login', state: { from: props.location } }} />);
        }}
      />
    );
  }
}

AuthenticatedRoute.propTypes = {
  render: PropTypes.func.isRequired,
  computedMatch: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getWorkspaceRequest: PropTypes.func.isRequired,
  accessGrantedToOrganisation: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  hasWorkspaceLoaded: PropTypes.func.isRequired,
  connectedUserLoaded: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  accessGrantedToOrganisation: hasAccessToOrganisation(state),
  hasWorkspaceLoaded: hasWorkspace(state),
  connectedUserLoaded: state.session.connectedUserLoaded
});

const mapDispatchToProps = {
  getWorkspaceRequest: getWorkspace.request
};

AuthenticatedRoute = connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticatedRoute);

export default AuthenticatedRoute;
