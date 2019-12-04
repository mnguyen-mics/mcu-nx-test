const getOrgFeatures = state => state.features.organisation;

const hasFeature = state => featureName => {
  return getOrgFeatures(state).includes(featureName);
};

const getFeatureFlagClient = state => state.features.client;

export {
  getOrgFeatures,
  hasFeature,
  getFeatureFlagClient
};
