import * as React from 'react';
import { connect } from 'react-redux';
import * as FeatureSelectors from '../redux/Features/selectors';
import { MicsReduxState } from '../utils/ReduxHelper';

interface FeatureSwitchProps {
  featureName: string;
  enabledComponent: JSX.Element;
  disabledComponent?: JSX.Element | null;
}

interface ReduxStateProps {
  hasFeature: (featureName: string) => boolean;
}

const FeatureSwitch: React.SFC<FeatureSwitchProps & ReduxStateProps> = ({
  featureName,
  enabledComponent,
  disabledComponent,
  hasFeature,
}) => {
  const componentIsEnabled = hasFeature(featureName);

  return componentIsEnabled ? enabledComponent : disabledComponent!;
};

FeatureSwitch.defaultProps = {
  disabledComponent: null,
};

export default connect((state: MicsReduxState) => ({
  hasFeature: FeatureSelectors.hasFeature(state),
}))(FeatureSwitch);
