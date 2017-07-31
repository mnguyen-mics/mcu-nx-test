import { createSelector } from 'reselect';

const isFetchingDisplayCreatives = state => state.creatives.displayCreatives.metadata.isFetching;
const hasDisplayCreatives = state => state.creatives.displayCreatives.hasItems;
const getDisplayCreativesTotal = state => state.creatives.displayCreatives.metadata.total;

const getDisplayCreatives = createSelector(
  state => state.creatives.displayCreatives.allIds,
  state => state.creatives.displayCreatives.byId,
  (allDisplayCreatives, displayCreativesById) => allDisplayCreatives.map(id => displayCreativesById[id])
);

export {
  getDisplayCreatives,
  isFetchingDisplayCreatives,
  hasDisplayCreatives,
  getDisplayCreativesTotal
};
