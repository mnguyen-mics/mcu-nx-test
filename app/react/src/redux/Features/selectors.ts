import { MicsReduxState } from '../../utils/ReduxHelper';

const getOrgFeatures = (state: MicsReduxState) => state.features.organisation;

const hasFeature = (state: MicsReduxState) => (featureName: string) => {
  return getOrgFeatures(state).includes(featureName);
};

const getFeatureFlagClient = (state: MicsReduxState) => state.features.client;

export { getOrgFeatures, hasFeature, getFeatureFlagClient };
