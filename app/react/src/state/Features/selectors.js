const getOrgFeatures = state => state.features.organisation;

const hasFeature = state => featureName => {
  return getOrgFeatures(state).includes(featureName);
};

export {
  getOrgFeatures,
  hasFeature,
};
