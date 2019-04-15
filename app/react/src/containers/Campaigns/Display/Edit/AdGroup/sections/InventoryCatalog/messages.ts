import { defineMessages } from 'react-intl';

export default defineMessages({
  selectPlaceholder: {
    id: 'inventory.catalog.select.placeholder',
    defaultMessage: 'Browse Inventory...',
  },
  detailedTargetingLabel: {
    id: 'inventory.catalog.inventory-selection.label',
    defaultMessage: 'Inventory Selection',
  },
  detailedTargetingNotice: {
    id: 'inventory.catalog.inventory-selection.notice',
    defaultMessage: 'INCLUDE inventory selection who match at least ONE of the following',
  },
  detailedTargetingTooltip: {
    id: 'inventory.catalog.inventory-selection.tooltip',
    defaultMessage: 'You can select inventory you have access to or your own placement lists as well as deal lists and keyword lists.',
  },
  detailedTargetingExclusionLabel: {
    id: 'inventory.catalog.inventory-selection-exclusion.label',
    defaultMessage: 'Exclude',
  },
  detailedTargetingExclusionNotice: {
    id: 'inventory.catalog.inventory-selection-exclusion.notice',
    defaultMessage: 'EXCLUDE inventory selection who match at least ONE of the following',
  },
  detailedTargetingExclusionTooltip: {
    id: 'inventory.catalog.inventory-selection-exclusion.tooltip',
    defaultMessage: 'You can exclude your own placement lists as well as deal lists and keyword lists.',
  },
  excludeLinkMsg: {
    id: 'inventory.catalog.exclude-inventory.link.label',
    defaultMessage: 'Exclude Inventory',
  },
  myKeywordListCategory: {
    id: 'inventory.catalog.my-keyword-category.label',
    defaultMessage: 'My Keyword Lists',
  },
  myDealListCategory: {
    id: 'inventory.catalog.my-deal-category.label',
    defaultMessage: 'My Deal Lists',
  },
  myPlacementListCategory: {
    id: 'inventory.catalog.my-placement-category.label',
    defaultMessage: 'My Placement Lists',
  },
});
