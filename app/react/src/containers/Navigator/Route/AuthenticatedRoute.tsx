
import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
  match,
  RouteComponentProps,
} from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import Error from '../../../components/Error';
import AuthService from '../../../services/AuthService';
import log from '../../../utils/Logger';
import { getWorkspace } from '../../../state/Session/actions';
import { fetchAllLabels } from '../../../state/Labels/actions';
import * as SessionHelper from '../../../state/Session/selectors';
import errorMessages from '../../Navigator/messages';
import * as featureSelector from '../../../state/Features/selectors';

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
  hasFeature: (feature: string) => boolean,
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = AuthenticatedRouteProps & InjectedIntlProps & MapStateToProps & MissingRouterProps;

type SubComponentProps = any & RouteComponentProps<RouteParams>;

class AuthenticatedRoute extends React.Component<Props> {

  static defaultProps = {
    requiredFeatures: undefined,
    requireDatamart: false
  }

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

  componentWillReceiveProps(nextProps: Props) {

    const {
      computedMatch: {
        params: { organisationId },
      },
    } = this.props;

    const {
      computedMatch: {
        params: { organisationId: nextOrganisationId },
      },
      getWorkspaceRequest
    } = nextProps;

    // TO BE REMOVED WHEN HOME PAGE IS AVAILABLE
    // if (nextOrganisationId !== organisationId) {
    //   window.location.href = `/v2/o/${nextOrganisationId}/campaigns/display`; // eslint-disable-line
    //   window.location.reload(true); // eslint-disable-line
    // }
    if (nextOrganisationId !== organisationId) {
      getWorkspaceRequest(nextOrganisationId);
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

    const authenticated = AuthService.isAuthenticated() && connectedUserLoaded; // if access token is present in local storage and valid

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


const mapStateToProps = (state: any) => ({
  accessGrantedToOrganisation: SessionHelper.hasAccessToOrganisation(state),
  hasWorkspaceLoaded: SessionHelper.hasWorkspace(state),
  connectedUserLoaded: state.session.connectedUserLoaded,
  hasFeature: featureSelector.hasFeature(state),
  hasDatamarts: SessionHelper.hasDatamarts(state)
});

const mapDispatchToProps = {
  getWorkspaceRequest: getWorkspace.request,
  getLabels: fetchAllLabels.request,
};

export default compose<Props, AuthenticatedRouteProps>(
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuthenticatedRoute);
