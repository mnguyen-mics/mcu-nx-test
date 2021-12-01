import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, match } from 'react-router-dom';
import * as featureSelector from '../../redux/Features/selectors';
import * as SessionHelper from '../../redux/Session/selectors';
import { DatamartResource } from '../../models/datamart/DatamartResource';
import { UserProfileResource } from '../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface InjectedFeaturesProps {
  hasFeature: (requiredFeatures?: string | string[], requireDatamart?: boolean) => boolean;
}

interface RouteParams {
  organisationId: string;
}

type Props = RouteComponentProps<RouteParams> & {
  getFeatureFlagClient: SplitIO.IClient;
  getDefaultDatamart: (orgnasationId: string) => DatamartResource;
} & {
  computedMatch: match<RouteParams>;
} & { [key: string]: any };

const mapStateToProps = (state: MicsReduxState) => {
  return {
    getFeatureFlagClient: featureSelector.getFeatureFlagClient(state),
    hasFeatureStore: featureSelector.hasFeature(state),
    getDefaultDatamart: SessionHelper.getDefaultDatamart(state),
    getConnectedUser: SessionHelper.getStoredConnectedUser(state),
  };
};

export default compose<any, InjectedFeaturesProps>(
  withRouter,
  connect(mapStateToProps),
  mapProps((props: Props) => {
    const { getDefaultDatamart, getFeatureFlagClient, getConnectedUser, hasFeatureStore, ...rest } =
      props;
    const organisationId =
      rest.match && rest.match.params && rest.match.params.organisationId
        ? rest.match.params.organisationId
        : rest.computedMatch && rest.computedMatch.params.organisationId
        ? rest.computedMatch.params.organisationId
        : '';
    const defaultDatamart = getDefaultDatamart(organisationId);
    const client: SplitIO.IClient = getFeatureFlagClient;
    const connectedUser: UserProfileResource = getConnectedUser;

    const attributes: SplitIO.Attributes = {
      user_id: connectedUser.id,
      is_mics: !!connectedUser.workspaces.find(ws => ws.organisation_id === '1'),
      organisation_ids: connectedUser.workspaces.map(ws => ws.organisation_id),
      locale: connectedUser.locale,
      domain: (window as any).MCS_CONSTANTS
        ? (window as any).MCS_CONSTANTS.NAVIGATOR_URL
        : window.location.host,
    };

    const hasFeature = (
      requiredFeatures?: string | string[],
      requireDatamart?: boolean,
    ): boolean => {
      // we first check if the feature is part of the experience defined at the domain name level
      if (requiredFeatures && typeof requiredFeatures === 'string') {
        if (hasFeatureStore(requiredFeatures)) {
          return hasFeatureStore(requiredFeatures) && (!!defaultDatamart || !requireDatamart);
        }
      } else if (requiredFeatures && Array.isArray(requiredFeatures)) {
        const hasAccess = requiredFeatures.reduce((acc, val) => {
          return hasFeatureStore(val) && (!!defaultDatamart || !requireDatamart);
        }, false);
        if (hasAccess) {
          return hasAccess;
        }
      } else if (!requiredFeatures) {
        return !!defaultDatamart || !requireDatamart;
      }

      // if it is not defined at the domain name level we try to see if the product team is running an experiment
      if (client) {
        if (requiredFeatures && typeof requiredFeatures === 'string') {
          if (!!defaultDatamart || !requireDatamart) {
            const treatment: SplitIO.Treatment = client.getTreatment(requiredFeatures, attributes);
            return treatment === 'on';
          }
          return false;
        } else if (requiredFeatures && Array.isArray(requiredFeatures)) {
          if (!!defaultDatamart || !requireDatamart) {
            const treatment: SplitIO.Treatments = client.getTreatments(
              requiredFeatures,
              attributes,
            );
            return Object.keys(treatment).reduce((acc, val) => {
              return acc === true ? treatment[val] === 'on' : false;
            }, true);
          }
          return false;
        } else if (!requiredFeatures) {
          return !!defaultDatamart || !requireDatamart;
        }
        return true;
      }
      return false;
    };

    return {
      hasFeature: hasFeature,
      ...rest,
    };
  }),
);
