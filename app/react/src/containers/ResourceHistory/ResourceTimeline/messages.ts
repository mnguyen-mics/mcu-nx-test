import { FormattedMessage, defineMessages } from "react-intl";

const messages: {
  [propertyName: string]: FormattedMessage.MessageDescriptor
} = defineMessages({
  defaultTitle: {
    id: 'timeline.title',
    defaultMessage: 'History'
  },
  defaultResourceType: {
    id: 'timeline.resourceType',
    defaultMessage: 'Resource',
  },
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
    defaultMessage: 'No Events in the last 6 months',
  },
  expandEvents: {
    id: 'timeline.events.card.expandEvents',
    defaultMessage: 'see more',
  },
  reduceEvents: {
    id: 'timeline.events.card.reduceEvents',
    defaultMessage: 'see less',
  },
  resourceCreated: {
    id: 'timeline.events.card.resourceCreated',
    defaultMessage: '{userName} created the {resourceType}.',
  },
  singleFieldEdited: {
    id: 'timeline.events.card.singleEdit',
    defaultMessage: '{userName} changed {field} from {oldValue} to {newValue}.',
  },
  severalFieldsEdited: {
    id: 'timeline.events.card.multiEdit.summary',
    defaultMessage: '{userName} has edited several fields.',
  },
  fieldInMultiEditList: {
    id: 'timeline.events.card.multiEdit.item',
    defaultMessage: '{field} from {oldValue} to {newValue}',
  },
  resourceDeleted: {
    id: 'timeline.events.card.resourceDeleted',
    defaultMessage: '{userName} deleted the {resourceType}.',
  },
  noValue: {
    id: 'timeline.events.card.field.noValue',
    defaultMessage: 'nothing',
  },
  unknownField: {
    id: 'timeline.events.card.edit.field',
    defaultMessage: 'Unknown Field',
  },
  date: {
    id: 'timeline.events.card.date',
    defaultMessage: ' {month} {day} at {time}',
  },
});

export default messages;
