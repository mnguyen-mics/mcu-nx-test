import * as React from 'react';
import { connect } from 'react-redux';
import * as FeatureSelectors from '../state/Features/selectors';

interface FeatureSwitchProps {
  featureName: string;
  enabledComponent: JSX.Element;
  disabledComponent?: JSX.Element | null;
}

interface ReduxStateProps {
  hasFeature: (featureName: string) => boolean;
}

const FeatureSwitch: React.SFC<FeatureSwitchProps & ReduxStateProps> = (
  { featureName, enabledComponent, disabledComponent, hasFeature },
) => {

  const componentIsEnabled = hasFeature(featureName);

  return componentIsEnabled ?
    enabledComponent : disabledComponent!;
};

FeatureSwitch.defaultProps = {
  disabledComponent: null,
};

export default connect(
  state => ({ hasFeature: FeatureSelectors.hasFeature(state) }),
)(FeatureSwitch);
