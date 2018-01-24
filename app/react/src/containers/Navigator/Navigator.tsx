import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { addLocaleData, injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';

import { LayoutManager } from '../../components/Layout/index';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { AuthenticatedRoute } from '../../containers/Route';
import { Notifications } from '../../containers/Notifications';
import { ForgotPassword } from '../ForgotPassword';
import { Login } from '../Login';
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';
import NavigatorService from '../../services/NavigatorService';
import { isAppInitialized } from '../../state/App/selectors';
import { logOut } from '../../state/Login/actions';
import { setColorsStore } from '../../state/Theme/actions';
import * as SessionHelper from '../../state/Session/selectors';
import OrgSelector from './OrgSelector';
import errorMessages from './messages';
import DrawerManager from '../../components/Drawer/DrawerManager';
import { DrawableContent } from '../../components/Drawer/index';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { getCookies } from '../../state/Session/actions';

interface MapStateToProps {
  initialized: boolean;
  initializationError: boolean;
  defaultWorkspaceOrganisationId?: string;
  workspaces: UserWorkspaceResource;
  drawableContents: DrawableContent[];
}

interface NavigatorState {
  adBlockOn: boolean;
}

type JoinedProps = MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

addLocaleData(enLocaleData || frLocaleData);

class Navigator extends React.Component<JoinedProps, NavigatorState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      adBlockOn: false,
    };
  }

  componentDidMount() {
    this.props.getCookies();
    NavigatorService.isAdBlockOn()
      .then(() => {
        // Read theme colors in DOM and store them in redux for future usage
        const rgb2hex = (rgb: string) => {
          const rgbTested = rgb.match(
            /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i,
          );
          return rgbTested && rgbTested.length === 4
            ? `#${`0${parseInt(rgbTested[1], 10).toString(16)}`.slice(
                -2,
              )}${`0${parseInt(rgbTested[2], 10).toString(16)}`.slice(
                -2,
              )}${`0${parseInt(rgbTested[3], 10).toString(16)}`.slice(-2)}`
            : '';
        };

        const elemts = (global as any).document.getElementsByClassName(
          'mcs-colors',
        )[0].children;

        const mcsColors: { [key: string]: string } = {};
        for (const elemt of elemts) {
          mcsColors[elemt.className] = rgb2hex(
            (global as any).window.getComputedStyle(elemt)['background-color'],
          );
        }
        setColorsStore(mcsColors);
      })
      .catch(() => this.setState({ adBlockOn: true }));
  }

  render() {
    const {
      defaultWorkspaceOrganisationId,
      intl: { formatMessage },
      initialized,
      initializationError,
      match,
    } = this.props;

    if (this.state.adBlockOn) {
      return <Error message={formatMessage(errorMessages.adBlock)} />;
    }
    if (initializationError) {
      return <Error message={formatMessage(errorMessages.generic)} />;
    }
    if (!initialized) return <Loading />; // allow app to bootstrap before render any routes, wait for translations, autologin, etc....

    let selectorSize = 200;

    const nbWorkspaces = Object.keys(this.props.workspaces).length;

    if (nbWorkspaces > 20) {
      selectorSize = 800;
    } else if (nbWorkspaces > 8) {
      selectorSize = 400;
    }

    const basePath = '/v2/o/:organisationId(\\d+)';
    const homeUrl = `/v2/o/${defaultWorkspaceOrganisationId}/campaigns/display`;

    const renderRoute = () => {
      const authenticated = AuthService.isAuthenticated();
      let redirectToUrl = '/login';
      if (authenticated) {
        redirectToUrl = homeUrl;
      }

      log.debug(`Redirect from ${match.url}  to ${redirectToUrl}`);
      return <Redirect to={redirectToUrl} />;
    };
    const loginRouteRender = () => {
      const authenticated = AuthService.isAuthenticated();
      if (authenticated) return <Redirect to={homeUrl} />;
      logOut();
      return <Login />;
    };

    const logoutRouteRender = () => {
      const { history } = this.props;
      const redirectCb = () => {
        history.push('/');
      };
      logOut(undefined, { redirectCb });
      return null;
    };

    const errorRouteRender = () => {
      return <Error message={formatMessage(errorMessages.notFound)} />;
    };

    const routeMapping = routes.map(route => {
      const authenticateRouteRender = () => (
        <div>
          <Notifications />
          <div className="drawer-wrapper">
            <DrawerManager />
          </div>

          <LayoutManager
            layout={route.layout}
            contentComponent={route.contentComponent}
            actionBarComponent={route.actionBarComponent}
            editComponent={route.editComponent}
            organisationSelector={OrgSelector}
            showOrgSelector={nbWorkspaces > 0}
            orgSelectorSize={selectorSize}
            {...this.props}
          />
        </div>
      );
      log.trace(`Available route : ${basePath}${route.path}`);
      return (
        <AuthenticatedRoute
          key={0} // shared key to reuse layout and avoid remounting components on route change
          exact={true}
          path={`${basePath}${route.path}`}
          render={authenticateRouteRender}
        />
      );
    });

    return (
      <Router>
        <Switch>
          <Route exact={true} path="/" render={renderRoute} />

          {routeMapping}

          <Route exact={true} path="/login" render={loginRouteRender} />
          <Route exact={true} path="/logout" render={logoutRouteRender} />

          <Route
            exact={true}
            path="/v2/forgot_password"
            component={ForgotPassword}
          />
          <Route render={errorRouteRender} />
        </Switch>
      </Router>
    );
  }
}

const mapStateToProps = (state: any) => ({
  initialized: isAppInitialized(state),
  initializationError: state.app.initializationError,
  workspaces: SessionHelper.getWorkspaces(state),
  defaultWorkspaceOrganisationId: SessionHelper.getDefaultWorkspaceOrganisationId(
    state,
  ),
});

const mapDispatchToProps = {
  logOut: logOut,
  setColorsStore: setColorsStore,
  getCookies: getCookies.request,
};

export default compose<JoinedProps, {}>(
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps),
)(Navigator);
