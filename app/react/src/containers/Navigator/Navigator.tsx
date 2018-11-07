import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { addLocaleData, injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';

import LayoutManager from './Layout/LayoutManager';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { AuthenticatedRoute } from './Route';
import { Notifications } from '../../containers/Notifications';
import { ForgotPassword } from '../Authentication/ForgotPassword';
import { Login } from '../Authentication/Login';
import { SetPassword } from '../Authentication/SetPassword'
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';
import NavigatorService from '../../services/NavigatorService';
import { isAppInitialized } from '../../state/App/selectors';
import * as loginActions from '../../state/Login/actions';
import { setColorsStore } from '../../state/Theme/actions';
import * as SessionHelper from '../../state/Session/selectors';
import OrgSelector from './OrgSelector';
import errorMessages from './messages';
import DrawerManager from '../../components/Drawer/DrawerManager';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import NoAccess from './NoAccess';
import { NavigatorRoute } from '../../routes/domain';
import angularRedirect from '../../routes/angularRedirect'
import RedirectAngular from './Route/RedirectAngular';
import { CommunityChangePassword } from '../Communities/ChangePassword';
import { CommunitySetPassword } from '../Communities/SetPassword';


interface MapStateToProps {
  initialized: boolean;
  initializationError: boolean;
  defaultWorkspaceOrganisationId?: string;
  workspaces: UserWorkspaceResource;
  setColorsStore: (mcsColors: { [key: string]: string }) => void;
  logOut: (action?: any, meta?: any) => void;
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
        this.props.setColorsStore(mcsColors);
      })
      .catch(() => this.setState({ adBlockOn: true }));
  }


  render() {
    const {
      defaultWorkspaceOrganisationId,
      intl: { formatMessage },
      initialized,
      initializationError,

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

    const renderRoute = ({ match }: any) => {
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
      this.props.logOut();
      return <Login />;
    };

    const logoutRouteRender = ({ history }: any) => {
      const redirectCb = () => {
        history.push('/');
      };
      this.props.logOut(undefined, { redirectCb });
      return null;
    };

    const errorRouteRender = () => {
      return <Error message={formatMessage(errorMessages.notFound)} />;
    };

    const routeMapping = routes.map((route: NavigatorRoute, i) => {
      const authenticateRouteRender = (props: any) => {
        const comps = route.layout === 'main' ? {
          contentComponent: route.contentComponent,
          actionBarComponent: route.actionBarComponent,
        } : route.layout === 'edit' ? {
          editComponent: route.editComponent,
        } : { contentComponent: route.contentComponent }
        return (
          <div>
            <Notifications />
            <div className="drawer-wrapper">
              <DrawerManager />
            </div>
            <LayoutManager
              layout={route.layout}              
              organisationSelector={OrgSelector}
              showOrgSelector={nbWorkspaces > 0}
              orgSelectorSize={selectorSize}
              {...comps}
              {...props}
            />
            <div id="mcs-edit-modal" />
          </div>
        );
      };

      const notAuthorizedRouteRender = (props: any) => {
        const comps = route.layout === 'main' ? {
          contentComponent: NoAccess,
        } : route.layout === 'settings' ? {
          contentComponent: NoAccess,
        } : {
          editComponent: NoAccess,
        }
        return (
          <div>
            <Notifications />
            <div className="drawer-wrapper">
              <DrawerManager />
            </div>
            <LayoutManager
              layout={route.layout}              
              organisationSelector={OrgSelector}
              showOrgSelector={nbWorkspaces > 0}
              orgSelectorSize={selectorSize}
              {...comps}
              {...props}
            />
            <div id="mcs-edit-modal" />
          </div>
        );
      };
      log.trace(`Available route : ${basePath}${route.path}`);

      return (
        <AuthenticatedRoute
          key={0} // shared key to reuse layout and avoid remounting components on route change
          exact={true}
          path={`${basePath}${route.path}`}
          render={authenticateRouteRender}
          errorRender={notAuthorizedRouteRender}
          requiredFeatures={route.requiredFeature}
          requireDatamart={route.requireDatamart}
        />
      );
    });

    return (
        <Switch>
          <Route exact={true} path="/set-password" component={SetPassword} />
          <Route exact={true} path="/" render={renderRoute} />

          <Route exact={true} path="/:communityToken/change-password" component={CommunityChangePassword} />
          <Route exact={true} path="/:communityToken/set-password" component={CommunitySetPassword} />

          {routeMapping}

          <Route exact={true} path="/login" render={loginRouteRender} />
          <Route exact={true} path="/logout" render={logoutRouteRender} />
          
          <Route
            exact={true}
            path="/v2/forgot_password"
            component={ForgotPassword}
          />
          
          {angularRedirect.map(redirect => {
            const render = () => <RedirectAngular from={redirect.from} to={redirect.to} baseUrl={basePath} />;
            return <Route key={redirect.from} exact={true} path={`${'/:orgDatamartSettings'}${redirect.from}`} render={render} />
          })}
          
          <Route render={errorRouteRender} />
        </Switch>
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
  logOut: loginActions.logOut,
  setColorsStore: setColorsStore,
};

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Navigator);
