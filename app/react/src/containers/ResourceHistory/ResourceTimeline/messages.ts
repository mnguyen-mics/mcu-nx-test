import { FormattedMessage, defineMessages } from "react-intl";

const messages: {
  [propertyName: string]: FormattedMessage.MessageDescriptor
} = defineMessages({
  today: {
    id: 'timeline.events.title.today',
    defaultMessage: 'Today',
  },
  yesterday: {
    id: 'timeline.events.title.yesterday',
    defaultMessage: 'Yesterday',
  },
  seeMore: {
    id: 'timeline.events.button.viewMore',
    defaultMessage: 'See More',
  },
  noEventsLeft: {
    id: 'timeline.events.button.noEventsLeft',
    defaultMessage: 'No Events Left',
  },
  noEvents: {
    id: 'timeline.events.button.noEvents',
    defaultMessage: 'No Events for this resource in the last 6 months',
    // use 'resource' ?
  },
});

export default messages;