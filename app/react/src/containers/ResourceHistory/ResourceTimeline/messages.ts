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
  noHistory: {
    id: 'timeline.events.noHistory',
    defaultMessage: 'No historical data in the last 6 months',
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
  initialFieldValue: {
    id: 'timeline.events.card.initialFieldValue',
    defaultMessage: '{field} set to {newValue}'
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
  resourceCreateLinkChild: {
    id: 'timeline.events.card.resourceCreateLinkChild',
    defaultMessage: '{userName} added the {resourceType} : {resourceName}',
  },
  resourceDeleteLinkChild: {
    id: 'timeline.events.card.resourceDeleteLinkChild',
    defaultMessage: '{userName} removed the {resourceType} : {resourceName}',
  },
  resourceCreateLinkParent: {
    id: 'timeline.events.card.resourceCreateLinkParent',
    defaultMessage: '{userName} added this {childResourceType} in {parentResourceType} : {parentResourceName}',
  },
  resourceDeleteLinkParent: {
    id: 'timeline.events.card.resourceDeleteLinkParent',
    defaultMessage: '{userName} removed this {childResourceType} in {parentResourceType} : {parentResourceName}',
  },
});

export default messages;
