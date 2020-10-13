
import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
  match,
} from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { IAuthService } from '../../../services/AuthService';
import log from '../../../utils/Logger';
import { getWorkspace } from '../../../redux/Session/actions';
import { fetchAllLabels } from '../../../redux/Labels/actions';
import * as SessionHelper from '../../../redux/Session/selectors';
import errorMessages from '../../Navigator/messages';
import injectFeatures, { InjectedFeaturesProps } from '../../Features/injectFeatures';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { Error } from '@mediarithmics-private/mcs-components-library';

export interface AuthenticatedRouteProps {
  render: (props: any) => JSX.Element;
  errorRender: (props: any) => JSX.Element;
  requiredFeatures?: string | string[];
  requireDatamart?: boolean;
  exact: boolean;
  path: string;
}

type RouteParams = { organisationId: string }

interface MissingRouterProps {
  computedMatch: match<RouteParams>
}

export interface MapStateToProps {
  accessGrantedToOrganisation: (organisationId: string) => boolean;
  connectedUserLoaded: boolean;
  getWorkspaceRequest: (organisationId: string) => void;
  hasWorkspaceLoaded: (organisationId: string) => boolean;
  getLabels: (organisationId: string) => void;
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = AuthenticatedRouteProps & InjectedIntlProps & MapStateToProps & MissingRouterProps & InjectedFeaturesProps;

type SubComponentProps = any;

class AuthenticatedRoute extends React.Component<Props> {

  static defaultProps = {
    requiredFeatures: undefined,
    requireDatamart: false
  }

  @lazyInject(TYPES.IAuthService)
  private _authService: IAuthService;

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

  componentDidUpdate(previousProps: Props) {

    const {
      computedMatch: {
        params: { organisationId },
      },
      getWorkspaceRequest
    } = this.props;

    const {
      computedMatch: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    // TO BE REMOVED WHEN HOME PAGE IS AVAILABLE
    // if (nextOrganisationId !== organisationId) {
    //   window.location.href = `/v2/o/${nextOrganisationId}/campaigns/display`; // eslint-disable-line
    //   window.location.reload(true); // eslint-disable-line
    // }
    if (previousOrganisationId !== organisationId) {
      getWorkspaceRequest(organisationId);
    }
  }

  checkIfHasFeatures = () => {
    const {
      requiredFeatures,
      requireDatamart,
      hasFeature,
      computedMatch: {
        params: { organisationId },
      },
      hasDatamarts,
    } = this.props;

    if (requiredFeatures && typeof requiredFeatures === 'string') {
      return hasFeature(requiredFeatures) && !(!hasDatamarts(organisationId) && requireDatamart);
    } else if (requiredFeatures && Array.isArray(requiredFeatures)) {
      return requiredFeatures.reduce((acc, val) => {
        return hasFeature(val) && !(!hasDatamarts(organisationId) && requireDatamart);
      }, false);
    } else if (!requiredFeatures) {
      return true && !(!hasDatamarts(organisationId) && requireDatamart);
    }
    return false;

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
      errorRender,
    } = this.props;

    const authenticated = this._authService.isAuthenticated() && connectedUserLoaded; // if access token is present
    const renderRoute = (props: SubComponentProps) => {
      if (authenticated) {

        if (accessGrantedToOrganisation(organisationId)) {
          log.trace(`Access granted to ${props.match.url}`);
          if (this.checkIfHasFeatures()) {
            return render(props);
          }
          return errorRender(props);

        }

        return <Error message={formatMessage(errorMessages.notFound)} />;
      } else if (this._authService.canAuthenticate()) {
        window.location.reload(); // Shouldn't happen since it can only occur if the access token is expired manually and the page is refreshed just after.
      }
      log.error(`Access denied to ${props.match.url}, redirect to login`);
      return (<Redirect to={{ pathname: '/login', state: { from: props.location } }} />);
    }

    return (
      <Route
        {...this.props}
        render={renderRoute}
      />
    );
  }
}


const mapStateToProps = (state: MicsReduxState) => ({
  accessGrantedToOrganisation: SessionHelper.hasAccessToOrganisation(state),
  hasWorkspaceLoaded: SessionHelper.hasWorkspace(state),
  connectedUserLoaded: state.session.connectedUserLoaded,
  hasDatamarts: SessionHelper.hasDatamarts(state)
});

const mapDispatchToProps = {
  getWorkspaceRequest: getWorkspace.request,
  getLabels: fetchAllLabels.request,
};

export default compose<Props, AuthenticatedRouteProps>(
  injectIntl,
  injectFeatures,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuthenticatedRoute);
