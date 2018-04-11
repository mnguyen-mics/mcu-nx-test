import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, match } from 'react-router-dom';

import * as featureSelector from '../../state/Features/selectors';
import * as SessionHelper from '../../state/Session/selectors';
import { Datamart } from '../../models/organisation/organisation';

export interface InjectedFeaturesProps {
  hasFeature: (requiredFeatures?: string | string[], requireDatamart?: boolean) => boolean;
}

interface RouteParams { organisationId: string }

type Props = RouteComponentProps<RouteParams> & {
  hasFeatureStore: (featureId: string) => boolean;
  getDefaultDatamart: (orgnasationId: string) => Datamart
} & {
  computedMatch: match<RouteParams>
} & { [key: string]: any };

const mapStateToProps = (state: any) => {
  return {
    hasFeatureStore: featureSelector.hasFeature(state),
    getDefaultDatamart: SessionHelper.getDefaultDatamart(state),
  };
};

export default compose<any, InjectedFeaturesProps>(
  withRouter,
  connect(mapStateToProps),
  mapProps(
    (
      props: Props,
    ) => {
      const { getDefaultDatamart, ...rest } = props;
      const organisationId = rest.match && rest.match.params && rest.match.params.organisationId ? rest.match.params.organisationId : rest.computedMatch && rest.computedMatch.params.organisationId ? rest.computedMatch.params.organisationId : ''
      const defaultDatamart = getDefaultDatamart(
        organisationId,
      );

      const hasFeature = (requiredFeatures?: string | string[], requireDatamart?: boolean): boolean => {
        if (requiredFeatures && typeof requiredFeatures === 'string') {
          return props.hasFeatureStore(requiredFeatures) && (!!defaultDatamart || !requireDatamart);
        } else if (requiredFeatures && Array.isArray(requiredFeatures)) {
          return requiredFeatures.reduce((acc, val) => {
            return props.hasFeatureStore(val) && (!!defaultDatamart || !requireDatamart);
          }, false);
        } else if (!requiredFeatures) {
          return !!defaultDatamart || !requireDatamart;
        }
        return true
      }
      return {
        hasFeature: hasFeature,
        ...rest,
      };
    },
  ),
);
