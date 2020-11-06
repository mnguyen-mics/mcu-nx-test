import { FormattedMessage, defineMessages } from 'react-intl';

const messages: {
  [propertyName: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  defaultTitle: {
    id: 'timeline.title',
    defaultMessage: 'History',
  },
  defaultResourceType: {
    id: 'timeline.defaultResourceType',
    defaultMessage: 'Resource',
  },
  adGroupResourceType: {
    id: 'timeline.resourceType.adGroup',
    defaultMessage: 'Ad Group',
  },
  displayCampaignResourceType: {
    id: 'timeline.resourceType.displayCampaign',
    defaultMessage: 'Display Campaign',
  },
  goalResourceType: {
    id: 'timeline.resourceType.goal',
    defaultMessage: 'Goal',
  },
  emailBlastResourceType: {
    id: 'timeline.resourceType.emailBlast',
    defaultMessage: 'Email Blast',
  },
  emailTemplateResourceType: {
    id: 'timeline.resourceType.emailTemplate',
    defaultMessage: 'Email Template',
  },
  emailCampaignResourceType: {
    id: 'timeline.resourceType.emailCampaign',
    defaultMessage: 'Email Campaign',
  },
  creativeResourceType: {
    id: 'timeline.resourceType.creative',
    defaultMessage: 'Creative',
  },
  segmentResourceType: {
    id: 'timeline.resourceType.segment',
    defaultMessage: 'Segment',
  },
  displayNetworkResourceType: {
    id: 'timeline.resourceType.displayNetwork',
    defaultMessage: 'Display Network',
  },
  keywordsListResourceType: {
    id: 'timeline.resourceType.keywordsList',
    defaultMessage: 'Keywords List',
  },
  dealListResourceType: {
    id: 'timeline.resourceType.dealList',
    defaultMessage: 'Deal List',
  },
  adExchangeResourceType: {
    id: 'timeline.resourceType.adxExchange',
    defaultMessage: 'Ad Exchange',
  },
  emailRouterResourceType: {
    id: 'timeline.resourceType.emailRouter',
    defaultMessage: 'Email Router',
  },
  exportResourceType: {
    id: 'timeline.resourceType.export',
    defaultMessage: 'Export',
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
    defaultMessage: '{userName} created the {resourceType} {parentLink}.',
  },
  parentLink: {
    id: 'timeline.events.card.resourceCreated.parentLink',
    defaultMessage: 'in the {parentType}: {parentName}',
  },
  initialFieldValue: {
    id: 'timeline.events.card.initialFieldValue',
    defaultMessage: '{field} set to {newValue}',
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
  childAddedMultiEditList: {
    id: 'timeline.events.card.multiEdit.child.added',
    defaultMessage: '{linkedResource} added : {value}',
  },
  childRemovedMultiEditList: {
    id: 'timeline.events.card.multiEdit.child.removed',
    defaultMessage: '{linkedResource} removed : {value}',
  },
  parentAddedMultiEditList: {
    id: 'timeline.events.card.multiEdit.parent.added',
    defaultMessage: 'added in the {linkedResource}: {value}',
  },
  parentRemovedMultiEditList: {
    id: 'timeline.events.card.multiEdit.parent.removed',
    defaultMessage: 'removed from the {linkedResource}: {value}',
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
    id: 'timeline.events.card.selection.resourceCreateLinkChild',
    defaultMessage: '{userName} added the {resourceType} : {resourceName}.',
  },
  resourceDeleteLinkChild: {
    id: 'timeline.events.card.selection.resourceDeleteLinkChild',
    defaultMessage: '{userName} removed the {resourceType} : {resourceName}.',
  },
  resourceCreateLinkParent: {
    id: 'timeline.events.card.selection.resourceCreateLinkParent',
    defaultMessage:
      '{userName} added this {childResourceType} in the {parentResourceType} : {parentResourceName}.',
  },
  resourceDeleteLinkParent: {
    id: 'timeline.events.card.selection.resourceDeleteLinkParent',
    defaultMessage:
      '{userName} removed this {childResourceType} from the {parentResourceType} : {parentResourceName}.',
  },
  deleted: {
    id: 'timeline.events.card.selection.deleted',
    defaultMessage: '(deleted)',
  },
  fetchingData: {
    id: 'timeline.events.card.selection.fetching',
    defaultMessage: '(fetching...)',
  },
});

export default messages;
