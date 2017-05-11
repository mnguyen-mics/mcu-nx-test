import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as sessionActions from '../../state/Session/actions';

export function requireAuthentication(Component) {

  class AuthenticatedComponent extends React.Component {

    componentDidMount() {
      this.checkAuth(this.props.authenticated);
    }

    checkAuth(authenticated) {
      const {
        refreshToken,
        location: {
          pathname,
          search
        },
        getAccessTokens,
        getConnectedUser,
        router
      } = this.props;

      const redirectAfterLogin = `${pathname}${search}`;
      const nextUrl = `${redirectAfterLogin}`;
      // don't use redirection until angular app is living
      // const loginUrl = `${PUBLIC_URL}/login?next=${redirectAfterLogin}`; // eslint-disable-line no-undef
      const loginUrl = `${PUBLIC_URL}/login`; // eslint-disable-line no-undef
      const redirect = (path) => {
        return Promise.resolve(router.replace(path));
      };

      if (refreshToken) {
        if (!authenticated) {
          getAccessTokens()
            .then(getConnectedUser)
            .then(() => redirect(nextUrl))
            .catch(() => redirect(loginUrl));
        }
      } else {
        redirect(loginUrl);
      }

    }

    render() {

      const { authenticated, activeWorkspace: { organisationId } } = this.props;
      const component = authenticated && organisationId ? <Component {...this.props} /> : null;

      return component;

    }
  }


  AuthenticatedComponent.defaultProps = {
    refreshToken: null
  };

  AuthenticatedComponent.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    refreshToken: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string
    }).isRequired,
    getAccessTokens: PropTypes.func.isRequired,
    getConnectedUser: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeWorkspace: PropTypes.shape({
      organisationId: PropTypes.string
    }).isRequired
  };

  const mapStateToProps = (state) => ({
    activeWorkspace: state.sessionState.activeWorkspace,
    authenticated: state.sessionState.authenticated,
    refreshToken: state.persistedState.refresh_token
  });

  const mapDispatchToProps = {
    getAccessTokens: sessionActions.getAccessToken,
    getConnectedUser: sessionActions.getConnectedUser
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthenticatedComponent);

}
