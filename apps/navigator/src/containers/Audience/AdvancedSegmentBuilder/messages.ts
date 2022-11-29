import { defineMessages, MessageDescriptor } from 'react-intl';
import { FrequencyMode } from './Edit/domain';

export const frequencyModeMessageMap: {
  [key in FrequencyMode]: MessageDescriptor;
} = defineMessages({
  AT_LEAST: {
    id: 'objectNode.frequency.mode.at-least',
    defaultMessage: 'At least',
  },
  AT_MOST: {
    id: 'objectNode.frequency.mode.at-most',
    defaultMessage: 'At most',
  },
});

export const messages = defineMessages({
  queryHasChanged: {
    id: 'jsonOtqlFormSection.queryHasChangedWarningMessage',
    defaultMessage:
      'Warning: you have edited your query but it is not saved yet. Please click on the Save button to save your modifications.',
  },
});
