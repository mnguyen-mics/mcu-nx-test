import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { addLocaleData, injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';
import Datalayer from './Datalayer';
import LayoutManager from './Layout/LayoutManager';
import { ForgotPassword } from '../Authentication/ForgotPassword';
import { Login } from '../Authentication/Login';
import { SetPassword } from '../Authentication/SetPassword';
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import { isAppInitialized } from '../../redux/App/selectors';
import * as loginActions from '../../redux/Login/actions';
import { setColorsStore } from '../../redux/Theme/actions';
import * as SessionHelper from '../../redux/Session/selectors';
import errorMessages from './messages';
import DrawerManager from '../../components/Drawer/DrawerManager';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import NoAccess from './NoAccess';
import { NavigatorRoute } from '../../routes/domain';
import { CommunityChangePassword } from '../Communities/ChangePassword';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { INavigatorService } from '../../services/NavigatorService';
import { Notifications } from '../../containers/Notifications';
import { Error, Loading } from '@mediarithmics-private/mcs-components-library';
import {
  AuthenticatedRoute,
  IAuthService,
  MicsReduxState,
} from '@mediarithmics-private/advanced-components';

interface MapStateToProps {
  initialized: boolean;
  initializationError: boolean;
  defaultWorkspaceOrganisationId?: string;
  workspaces: UserWorkspaceResource[];
  setColorsStore: (mcsColors: { [key: string]: string }) => void;
  logOut: (action?: any, meta?: any) => void;
  fetchAllAudienceSegmentMetrics: (organisationId: string) => void;
}

interface NavigatorState {
  adBlockOn: boolean;
  error: boolean;
  datamartIds: string[];
}

type JoinedProps = MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

addLocaleData(enLocaleData || frLocaleData);

class Navigator extends React.Component<JoinedProps, NavigatorState> {
  @lazyInject(TYPES.INavigatorService)
  private _navigatorService: INavigatorService;

  @lazyInject(TYPES.IAuthService)
  private _authService: IAuthService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      adBlockOn: false,
      error: false,
      datamartIds: [],
    };
  }

  componentDidMount() {
    this._navigatorService
      .isAdBlockOn()
      .then(() => {
        // Read theme colors in DOM and store them in redux for future usage
        const rgb2hex = (rgb: string) => {
          const rgbTested = rgb.match(
            /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i,
          );
          return rgbTested && rgbTested.length === 4
            ? `#${`0${parseInt(rgbTested[1], 10).toString(16)}`.slice(-2)}${`0${parseInt(
                rgbTested[2],
                10,
              ).toString(16)}`.slice(-2)}${`0${parseInt(rgbTested[3], 10).toString(16)}`.slice(-2)}`
            : '';
        };

        const elemts = (global as any).document.getElementsByClassName('mcs-colors')[0].children;

        const mcsColors: { [key: string]: string } = {};
        for (const elemt of [...elemts]) {
          mcsColors[elemt.className] = rgb2hex(
            (global as any).window.getComputedStyle(elemt)['background-color'],
          );
        }
        this.props.setColorsStore(mcsColors);
        document.addEventListener(
          'unauthorizedEvent',
          e => {
            this._authService.deleteCredentials();
            this.props.history.push({ pathname: '/', state: this.props.location.state });
          },
          false,
        );
      })
      .catch(() => this.setState({ adBlockOn: true }));
  }

  componentDidCatch() {
    this.setState({ error: true });
  }

  render() {
    const {
      defaultWorkspaceOrganisationId,
      workspaces,
      intl: { formatMessage },
      initialized,
      initializationError,
    } = this.props;

    const { error, adBlockOn } = this.state;

    if (adBlockOn) {
      return <Error message={formatMessage(errorMessages.adBlock)} />;
    }

    if (initializationError) {
      return <Error message={formatMessage(errorMessages.generic)} />;
    }

    if (error) {
      return <Error message={formatMessage(errorMessages.generic)} />;
    }

    if (!initialized) return <Loading isFullScreen={false} />; // allow app to bootstrap before render any routes, wait for translations, autologin, etc....

    const basePath = '/v2/o/:organisationId(\\d+)';
    const homeUrl =
      workspaces &&
      defaultWorkspaceOrganisationId &&
      workspaces[parseInt(defaultWorkspaceOrganisationId, 0)] &&
      workspaces[parseInt(defaultWorkspaceOrganisationId, 0)].datamarts &&
      workspaces[parseInt(defaultWorkspaceOrganisationId, 0)].datamarts.length > 0
        ? `/v2/o/${defaultWorkspaceOrganisationId}/audience/segments`
        : `/v2/o/${defaultWorkspaceOrganisationId}/campaigns/display`;

    const renderRoute = ({ match }: RouteComponentProps<{ organisationId: string }>) => {
      const authenticated = this._authService.isAuthenticated();
      let redirectToUrl = '/login';
      if (authenticated) {
        redirectToUrl = homeUrl;
      }

      log.debug(`Redirect from ${match.url}  to ${redirectToUrl}`);
      return <Redirect to={{ pathname: redirectToUrl, state: this.props.location.state }} />;
    };
    const loginRouteRender = () => {
      const authenticated =
        this._authService.isAuthenticated() || this._authService.canAuthenticate();
      if (authenticated) return <Redirect to={homeUrl} />;
      this.props.logOut();
      return <Login />;
    };

    const logoutRouteRender = () => {
      const redirectCb = () => {
        this.props.history.push({
          pathname: '/',
        });
      };
      this.props.logOut(undefined, { redirectCb });
      return null;
    };

    const errorRouteRender = () => {
      return <Error message={formatMessage(errorMessages.notFound)} />;
    };

    const routeMapping = routes.map((route: NavigatorRoute, i) => {
      const authenticateRouteRender = (props: any) => {
        const comps =
          route.layout === 'main'
            ? {
                contentComponent: route.contentComponent,
                actionBarComponent: route.actionBarComponent,
              }
            : route.layout === 'edit'
            ? {
                editComponent: route.editComponent,
              }
            : { contentComponent: route.contentComponent };
        const datalayer = route.datalayer;
        return (
          <Datalayer datalayer={datalayer}>
            <Notifications />
            <div className='drawer-wrapper'>
              <DrawerManager />
            </div>
            <LayoutManager
              layout={route.layout}
              {...comps}
              {...props}
            />
            <div id='mcs-edit-modal' />
          </Datalayer>
        );
      };

      const notAuthorizedRouteRender = (props: any) => {
        const comps =
          route.layout === 'main'
            ? {
                contentComponent: NoAccess,
              }
            : route.layout === 'settings'
            ? {
                contentComponent: NoAccess,
              }
            : {
                editComponent: NoAccess,
              };
        const datalayer = route.datalayer;
        return (
          <Datalayer datalayer={datalayer}>
            <Notifications />
            <div className='drawer-wrapper'>
              <DrawerManager />
            </div>
            <LayoutManager
              layout={route.layout}
              {...comps}
              {...props}
            />
            <div id='mcs-edit-modal' />
          </Datalayer>
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
        <Route exact={true} path='/set-password' component={SetPassword} />
        <Route exact={true} path='/' render={renderRoute} />

        {routeMapping}

        <Route exact={true} path='/login' render={loginRouteRender} />
        <Route exact={true} path='/logout' render={logoutRouteRender} />

        <Route
          exact={true}
          path='/:communityToken/change-password'
          component={CommunityChangePassword}
        />
        <Route
          exact={true}
          path='/:communityToken/set-password'
          component={CommunityChangePassword}
        />

        <Route exact={true} path='/v2/forgot_password' component={ForgotPassword} />

        <Route render={errorRouteRender} />
      </Switch>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  initialized: isAppInitialized(state),
  initializationError: state.app.initializationError,
  workspaces: SessionHelper.getWorkspaces(state),
  defaultWorkspaceOrganisationId: SessionHelper.getDefaultWorkspaceOrganisationId(state),
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
