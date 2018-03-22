import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import * as featureSelector from '../../state/Features/selectors';
import * as SessionHelper from '../../state/Session/selectors';
import { Datamart } from '../../models/organisation/organisation';

export interface InjectedFeaturesProps {
  hasFeature: (requiredFeatures?: string | string[], requireDatamart?: boolean) => boolean;
}

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
      props: RouteComponentProps<{ organisationId: string }> & {
        hasFeatureStore: (featureId: string) => boolean;
        getDefaultDatamart: (orgnasationId: string) => Datamart
      } & { [key: string]: any },
    ) => {
      const { getDefaultDatamart, ...rest } = props;
      const defaultDatamart = getDefaultDatamart(
        rest.match.params.organisationId,
      );

      const hasFeature = (requiredFeatures?: string | string[], requireDatamart?: boolean): boolean => {
        if (requiredFeatures && typeof requiredFeatures === 'string') {
          return props.hasFeatureStore(requiredFeatures) && !(!defaultDatamart && requireDatamart);
        } else if (requiredFeatures && Array.isArray(requiredFeatures)) {
          return requiredFeatures.reduce((acc, val) => {
            return props.hasFeatureStore(val) && !(!defaultDatamart && requireDatamart);
          }, false);
        } else if (!requiredFeatures) {
          return true && !(!defaultDatamart && requireDatamart);
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
