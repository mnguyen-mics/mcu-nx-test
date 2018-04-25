import { defineMessages, FormattedMessage } from 'react-intl';
import { FrequencyMode } from './Edit/domain';

export const frequencyModeMessageMap: {
  [key in FrequencyMode]: FormattedMessage.MessageDescriptor
} = defineMessages({
  AT_LEAST: {
    id: 'objectNode.frequency.mode.at-least',
    defaultMessage: 'At least'
  },
  AT_MOST: {
    id: 'objectNode.frequency.mode.at-most',
    defaultMessage: 'At most'
  },
});
