import { createSelector } from 'reselect';

const isFetchingNativeCreatives = state => state.creatives.nativeCreatives.metadata.isFetching;
const hasNativeCreatives = state => state.creatives.nativeCreatives.hasItems;
const getNativeCreativesTotal = state => state.creatives.nativeCreatives.metadata.total;

const getNativeCreatives = createSelector(
  state => state.creatives.nativeCreatives.allIds,
  state => state.creatives.nativeCreatives.byId,
  (allNativeCreatives, nativeCreativesById) => allNativeCreatives.map(id => nativeCreativesById[id]),
);

export {
  getNativeCreatives,
  isFetchingNativeCreatives,
  hasNativeCreatives,
  getNativeCreativesTotal,
};
