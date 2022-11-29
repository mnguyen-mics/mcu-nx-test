import { AbstractMessages } from '@mediarithmics-private/mcs-components-library/lib/utils/IntlHelper';
import { defineMessages, MessageDescriptor, IntlShape } from 'react-intl';

interface CustomMessageDescriptor {
  [propertyName: string]: MessageDescriptor;
}

export const convertMessageDescriptorToString = (
  intlMessages: CustomMessageDescriptor,
  intl: IntlShape,
): AbstractMessages => {
  const messages = Object.keys(intlMessages).map((key: string) => {
    return { [key]: intl.formatMessage(intlMessages[key]) };
  });

  return Object.assign({}, ...messages);
};

export const deviceCardMessages: CustomMessageDescriptor = defineMessages({
  deviceTitle: {
    id: 'id1',
    defaultMessage: 'User Device',
  },
  emptyDevice: {
    id: 'id2',
    defaultMessage: 'This user has no Devices',
  },
  viewMore: {
    id: 'id3',
    defaultMessage: 'View More',
  },
  viewLess: {
    id: 'id4',
    defaultMessage: 'View Less',
  },
});

export const mcsDateRangePickerMessages: CustomMessageDescriptor = defineMessages({
  TODAY: {
    id: 'components.mcsDateRangePicker.range.today',
    defaultMessage: 'Today',
  },
  YESTERDAY: {
    id: 'components.mcsDateRangePicker.range.yesterday',
    defaultMessage: 'Yesterday',
  },
  LAST_7_DAYS: {
    id: 'components.mcsDateRangePicker.range.last7days',
    defaultMessage: 'Last 7 days',
  },
  LAST_30_DAYS: {
    id: 'components.mcsDateRangePicker.range.last30days',
    defaultMessage: 'Last 30 days',
  },
  LOOKBACK_WINDOW: {
    id: 'components.mcsDateRangePicker.lookBackWindow',
    defaultMessage: 'Lookback Window',
  },
  CUSTOM: {
    id: 'components.mcsDateRangePicker.custom',
    defaultMessage: 'Custom',
  },
  ABSOLUTE_TIME_RANGE: {
    id: 'components.mcsDateRangePicker.absoluteTimeRange',
    defaultMessage: 'Absolute time range',
  },
  RELATIVE_TIME_RANGE: {
    id: 'components.mcsDateRangePicker.relativeTimeRange',
    defaultMessage: 'Relative time ranges',
  },
});

export const labelSelectorMessages: CustomMessageDescriptor = defineMessages({
  labelNoResults: {
    id: 'components.labelsSelector.noResults',
    defaultMessage: 'No Results',
  },
  labelButton: {
    id: 'components.labelsSelector.label.button',
    defaultMessage: 'Label',
  },
});

export const infiniteListMessages: CustomMessageDescriptor = defineMessages({
  searchBarPlaceholder: {
    id: 'settings.services.infinite.scroll.searchBar.placeholder',
    defaultMessage: 'Enter your search here',
  },
  loadingSearchBarPlaceholder: {
    id: 'settings.services.infinite.scroll.loading.data.searchBar.placeholder',
    defaultMessage: 'Loading, please wait....',
  },
});

export const menuSubListMessages: CustomMessageDescriptor = defineMessages({
  empty: {
    id: 'components.formMenu.menuSubList.empty',
    defaultMessage: 'Empty',
  },
});
