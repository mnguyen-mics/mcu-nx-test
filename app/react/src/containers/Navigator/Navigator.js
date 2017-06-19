/* eslint-disable no-undef */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

import { LayoutManager } from '../../components/Layout';
import { NotFound } from '../../components/NotFound';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AuthenticatedRoute } from '../../containers/Route';
import { Notifications } from '../../containers/Notifications';
import { Login } from '../Login';
import { getDefaultWorspaceOrganisationId } from '../../state/Session/selectors';
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';
import { isAppInitialized } from '../../state/App/selectors';
import { logOut } from '../../state/Login/actions';

class Navigator extends Component {

  render() {

    const {
      locale,
      translations,
      initialized,
      initializationError,
      defaultWorspaceOrganisationId
    } = this.props;

    if (initializationError) return (<Error />);
    if (!initialized) return (<Loading />); // allow app to bootstrap before render any routes, wait for translations, autologin, etc....

    const basePath = '/v2/o/:organisationId(\\d+)';
    const authenticated = AuthService.isAuthenticated();

    return (
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <LocaleProvider locale={enUS}>
          { /* <NotificationCenter /> */}
          <Router>
            <Switch>
              <Route
                exact path="/" render={({ match }) => {

                  let redirectToUrl = '/login';
                  if (authenticated) {
                    redirectToUrl = `/v2/o/${defaultWorspaceOrganisationId}/campaigns/display`;
                  }

                  log.debug(`Redirect from ${match.url}  to ${redirectToUrl}`);
                  return (<Redirect to={redirectToUrl} />);
                }
              }
              />

              { routes.map(route => {
                log.trace(`Available route : ${basePath}${route.path}`);
                return (
                  <AuthenticatedRoute
                    key={0} // shared key to reuse layout and avoid remounting components on route change
                    exact
                    path={`${basePath}${route.path}`}
                    render={(props) => (
                      <div>
                        <Notifications />
                        <LayoutManager
                          layout={route.layout}
                          contentComponent={route.contentComponent}
                          actionBarComponent={route.actionBarComponent}
                          {...props}
                        />
                      </div>
                    )}
                  />
                );
              }) }

              <Route exact path="/login" component={Login} />
              <Route
                exact
                path="/logout"
                render={({ history }) => {
                  const redirectCb = () => { history.push('/'); };
                  this.props.logOut(undefined, { redirectCb });
                  return (null);
                }}
              />
              { /*
              <Route exact path='/forgot-password' component={ForgotPassword} />
            */ }
              <Route
                render={() => {
                  return (<NotFound />);
                }}
              />
            </Switch>
          </Router>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}

// TODO find browser locale
Navigator.defaultProps = {
  locale: 'en',
  translations: {},
};

Navigator.propTypes = {
  locale: PropTypes.string,
  initialized: PropTypes.bool.isRequired,
  initializationError: PropTypes.bool.isRequired,
  translations: PropTypes.objectOf(PropTypes.string),
  defaultWorspaceOrganisationId: PropTypes.string.isRequired,
  logOut: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  initialized: isAppInitialized(state),
  initializationError: state.app.initializationError,
  defaultWorspaceOrganisationId: getDefaultWorspaceOrganisationId(state)
});

const mapDispatchToProps = {
  logOut: logOut
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
