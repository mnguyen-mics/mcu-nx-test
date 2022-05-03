import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { addLocaleData, injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import enLocaleData from 'react-intl/locale-data/en';
import frLocaleData from 'react-intl/locale-data/fr';
import Datalayer from './Datalayer';
import LayoutManager from './Layout/LayoutManager';
import routes from '../../routes/routes';
import log from '../../utils/Logger';
import { isAppInitialized } from '../../redux/App/selectors';
import * as loginActions from '../../redux/Login/actions';
import { setColorsStore } from '../../redux/Theme/actions';
import * as SessionHelper from '../../redux/Session/selectors';
import OrgSelector from './OrgSelector';
import errorMessages from './messages';
import DrawerManager from '../../components/Drawer/DrawerManager';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import NoAccess from './NoAccess';
import { NavigatorRoute } from '../../routes/domain';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { INavigatorService } from '../../services/NavigatorService';
import { Notifications } from '../../containers/Notifications';
import { Error, Loading } from '@mediarithmics-private/mcs-components-library';
import { RenderOnAuthenticated, MicsReduxState } from '@mediarithmics-private/advanced-components';

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

class NavigatorWithKeycloak extends React.Component<JoinedProps, NavigatorState> {
  @lazyInject(TYPES.INavigatorService)
  private _navigatorService: INavigatorService;

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
      })
      .catch(() => this.setState({ adBlockOn: true }));
  }

  componentDidCatch() {
    this.setState({ error: true });
  }

  render() {
    const {
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

    let selectorSize = 200;

    const nbWorkspaces = this.props.workspaces ? Object.keys(this.props.workspaces).length : 0;

    if (nbWorkspaces > 20) {
      selectorSize = 800;
    } else if (nbWorkspaces > 8) {
      selectorSize = 400;
    }

    const basePath = '/v2/o/:organisationId(\\d+)';

    const buildHomeUrl = (organisationId: string) => {
      const { workspaces } = this.props;
      return workspaces?.[parseInt(organisationId, 0)]?.datamarts?.length > 0
        ? `/v2/o/${organisationId}/home`
        : `/v2/o/${organisationId}/campaigns/display`;
    };

    const renderSlashRoute = ({ match }: RouteComponentProps<{ organisationId: string }>) => {
      const redirectTo = () => {
        const { defaultWorkspaceOrganisationId } = this.props;

        if (defaultWorkspaceOrganisationId && defaultWorkspaceOrganisationId !== 'none') {
          return buildHomeUrl(defaultWorkspaceOrganisationId);
        }
        return undefined;
      };
      return (
        <RenderOnAuthenticated getRedirectUriFunction={redirectTo}>
          <Loading isFullScreen={true} />
        </RenderOnAuthenticated>
      );
    };

    const errorRouteRender = () => {
      return <Error message={formatMessage(errorMessages.notFound)} />;
    };

    const routeMapping = routes.map((route: NavigatorRoute, i) => {
      const renderRoute = (props: any) => {
        const compsForRender =
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

        const compsForRenderWhenError =
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

        const renderValue = (comps: {
          contentComponent?: React.ComponentType;
          actionBarComponent?: React.ComponentType | null;
        }) => {
          return (
            <Datalayer datalayer={datalayer}>
              <Notifications />
              <div className='drawer-wrapper'>
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
              <div id='mcs-edit-modal' />
            </Datalayer>
          );
        };

        return (
          <RenderOnAuthenticated
            requiredFeatures={route.requiredFeature}
            requireDatamart={route.requireDatamart}
            renderOnError={renderValue(compsForRenderWhenError)}
            homePage={buildHomeUrl}
          >
            {renderValue(compsForRender)}
          </RenderOnAuthenticated>
        );
      };

      log.trace(`Available route : ${basePath}${route.path}`);

      return <Route exact={true} path={`${basePath}${route.path}`} render={renderRoute} key={0} />;
    });

    return (
      <Switch>
        <Route exact={true} path='/' render={renderSlashRoute} />
        <Route exact={true} path='/login' render={renderSlashRoute} />
        {routeMapping}
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
)(NavigatorWithKeycloak);
