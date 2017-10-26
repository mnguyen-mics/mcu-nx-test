import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { IntlProvider, addLocaleData } from 'react-intl';

import { LocaleProvider } from 'antd';

import enUS from 'antd/lib/locale-provider/en_US';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';

import { LayoutManager } from '../../components/Layout/index.ts';
import NotFound from '../../components/NotFound.tsx';
import Loading from '../../components/Loading.tsx';
import Error from '../../components/Error.tsx';
import { AuthenticatedRoute } from '../../containers/Route';
import { Notifications } from '../../containers/Notifications';
import { ForgotPassword } from '../ForgotPassword';
import { Login } from '../Login';
import { getDefaultWorkspaceOrganisationId } from '../../state/Session/selectors';
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';
import { isAppInitialized } from '../../state/App/selectors';
import { logOut } from '../../state/Login/actions';
import { setColorsStore } from '../../state/Colors/actions';

addLocaleData([enLocaleData, frLocaleData]);

class Navigator extends Component {

  componentDidMount() {
    // Read theme colors in DOM and store them in redux for future usage

    function rgb2hex(rgb) {
      const rgbTested = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
      return (rgbTested && rgbTested.length === 4) ? `#${
       (`0${parseInt(rgbTested[1], 10).toString(16)}`).slice(-2)
       }${(`0${parseInt(rgbTested[2], 10).toString(16)}`).slice(-2)
       }${(`0${parseInt(rgbTested[3], 10).toString(16)}`).slice(-2)}` : '';
    }
    const elemts = global.document.getElementsByClassName('mcs-colors')[0].children;
    const mcsColors = {};

    for (let i = 0; i < elemts.length; i += 1) {
      const elem = elemts[i];
      mcsColors[elem.className] = rgb2hex(global.window.getComputedStyle(elem)['background-color']);
    }
    this.props.setColorsStore(mcsColors);
  }


  render() {

    const {
      locale,
      translations,
      initialized,
      initializationError,
      defaultWorkspaceOrganisationId,
    } = this.props;

    if (initializationError) return (<Error />);
    if (!initialized) return (<Loading />); // allow app to bootstrap before render any routes, wait for translations, autologin, etc....

    const basePath = '/v2/o/:organisationId(\\d+)';
    const homeUrl = `/v2/o/${defaultWorkspaceOrganisationId}/campaigns/display`;
    return (
      <IntlProvider locale={locale} messages={translations}>
        <LocaleProvider locale={enUS}>
          { /* <NotificationCenter /> */}
          <Router>
            <Switch>
              <Route
                exact path="/" render={({ match }) => {
                  const authenticated = AuthService.isAuthenticated();
                  let redirectToUrl = '/login';
                  if (authenticated) {
                    redirectToUrl = homeUrl;
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
                          editComponent={route.editComponent}
                          {...props}
                        />
                      </div>
                    )}
                  />
                );
              }) }

              <Route
                exact path="/login" render={() => {
                  const authenticated = AuthService.isAuthenticated();
                  if (authenticated) return (<Redirect to={homeUrl} />);
                  this.props.logOut();
                  return (<Login />);
                }}
              />
              <Route
                exact
                path="/logout"
                render={({ history }) => {
                  const redirectCb = () => { history.push('/'); };
                  this.props.logOut(undefined, { redirectCb });
                  return (null);
                }}
              />

              <Route exact path="/v2/forgot_password" component={ForgotPassword} />
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
  defaultWorkspaceOrganisationId: PropTypes.string.isRequired,
  logOut: PropTypes.func.isRequired,
  setColorsStore: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  initialized: isAppInitialized(state),
  initializationError: state.app.initializationError,
  defaultWorkspaceOrganisationId: getDefaultWorkspaceOrganisationId(state),
});

const mapDispatchToProps = {
  logOut: logOut,
  setColorsStore: setColorsStore,
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigator);

export default Navigator;
