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
    id: 'timeline.events.noEventsLeft',
    defaultMessage: 'No Events Left',
  },
  noEvents: {
    id: 'timeline.events.noEvents',
    defaultMessage: 'No Events for this resource in the last 6 months',
    // use 'resource' ?
  },
  expandEvents: {
    id: 'timeline.events.card.expandEvents',
    defaultMessage: 'see more',
  },
  reduceEvents: {
    id: 'timeline.events.card.reduceEvents',
    defaultMessage: 'see less',
  },
});

export default messages;