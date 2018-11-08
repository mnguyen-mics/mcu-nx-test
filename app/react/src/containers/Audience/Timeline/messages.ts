import { defineMessages, FormattedMessage } from 'react-intl';

const messages: {
  [propertyName: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  lookUpUser: {
    id: 'timeline.actionbar.lookup',
    defaultMessage: 'User Lookup',
  },
  viewMore: {
    id: 'timeline.content.viewMore',
    defaultMessage: 'View More',
  },
  viewLess: {
    id: 'timeline.content.viewLess',
    defaultMessage: 'View Less',
  },
  visitor: {
    id: 'timeline.content.header.visitor',
    defaultMessage: 'Visitor',
  },
  activities: {
    id: 'timeline.content.header.activities',
    defaultMessage: 'Activities',
  },
  identifiers: {
    id: 'timeline.content.header.identifiers',
    defaultMessage: 'Identifiers',
  },
  profileTitle: {
    id: 'timeline.card.profile.title',
    defaultMessage: 'Profile',
  },
  emptyProfile: {
    id: 'timeline.card.profile.empty',
    defaultMessage: 'This user has no Profile Information',
  },
  segmentTitle: {
    id: 'timeline.card.segment.title',
    defaultMessage: 'Segments',
  },
  emptySegment: {
    id: 'timeline.card.segment.empty',
    defaultMessage: 'This user has no Segment Information',
  },
  accountTitle: {
    id: 'timeline.card.account.title',
    defaultMessage: 'User Account Id',
  },
  unknownCompartmentName: {
    id: 'timeline.card.user.account.unknown.compartment.name',
    defaultMessage: 'Unknown compartment name',
  },
  emptyAccount: {
    id: 'timeline.card.account.empty',
    defaultMessage: 'This user has no Account Information',
  },
  deviceTitle: {
    id: 'timeline.card.device.title',
    defaultMessage: 'User Device',
  },
  emptyDevice: {
    id: 'timeline.card.device.empty',
    defaultMessage: 'This user has no Devices',
  },
  emailTitle: {
    id: 'timeline.card.email.title',
    defaultMessage: 'User Email',
  },
  emptyEmail: {
    id: 'timeline.card.email.empty',
    defaultMessage: 'This user has no Emails',
  },
  nullEmail: {
    id: 'timeline.card.email.modal.null',
    defaultMessage: 'null',
  },
  okModalEmail: {
    id: 'timeline.card.email.modal.ok',
    defaultMessage: 'Ok',
  },
  titleModalEmail: {
    id: 'timeline.card.email.modal.title',
    defaultMessage: 'Email Information',
  },
  emailAddress: {
    id: 'timeline.card.email.modal.emailAddress',
    defaultMessage: 'Email Address',
  },
  emailCreation: {
    id: 'timeline.card.email.modal.creationdate',
    defaultMessage: 'Creation Date',
  },
  emailActivity: {
    id: 'timeline.card.email.modal.lastActivity',
    defaultMessage: 'Last Activity Date',
  },
  emailInfo: {
    id: 'timeline.card.email.modal.information',
    defaultMessage: 'Information',
  },
  emailConsent: {
    id: 'timeline.card.email.modal.consent',
    defaultMessage: 'Consent',
  },
  CREATION_TS: {
    id: 'timeline.card.email.modal.CREATION_TS',
    defaultMessage: 'Creation Date',
  },
  LAST_ACTIVITY_TS: {
    id: 'timeline.card.email.modal.LAST_ACTIVITY_TS',
    defaultMessage: 'Last Activity Date',
  },
  LAST_MODIFIED_TS: {
    id: 'timeline.card.email.modal.LAST_MODIFIED_TS',
    defaultMessage: 'Last Modified Date',
  },
  EXPIRATION_TS: {
    id: 'timeline.card.email.modal.EXPIRATION_TS',
    defaultMessage: 'Expiration Date',
  },
  TECHNICAL_NAME: {
    id: 'timeline.card.email.modal.TECHNICAL_NAME',
    defaultMessage: 'Technical Name',
  },
  ACTIVE: {
    id: 'timeline.card.email.modal.ACTIVE',
    defaultMessage: 'Active',
  },
  STATUS: {
    id: 'timeline.card.email.modal.STATUS',
    defaultMessage: 'Status',
  },
  origin: {
    id: 'timeline.card.activity.origin.title',
    defaultMessage: 'Origin',
  },
  direct: {
    id: 'timeline.card.activity.origin.direct',
    defaultMessage: 'Direct',
  },
  topics: {
    id: 'timeline.card.activity.topics.title',
    defaultMessage: 'Topics',
  },
  seeMore: {
    id: 'timeline.activities.button.viewMore',
    defaultMessage: 'See More',
  },
  noActivitiesLeft: {
    id: 'timeline.activities.button.noActivitiesLeft',
    defaultMessage: 'No Activities Left',
  },
  noActivities: {
    id: 'timeline.activities.button.noActivities',
    defaultMessage: 'No Activities for this user',
  },
  today: {
    id: 'timeline.activities.title.today',
    defaultMessage: 'Today',
  },
  yesterday: {
    id: 'timeline.activities.title.yesterday',
    defaultMessage: 'Yesterday',
  },
  lastSeen: {
    id: 'timeline.title.lastSeen',
    defaultMessage: 'Last Seen At',
  },
  monitoring: {
    id: 'timeline.title',
    defaultMessage: 'Monitoring',
  },
  detail: {
    id: 'timeline.activity.events.detail',
    defaultMessage: 'Details',
  },
  eventJson: {
    id: 'timeline.activity.events.json',
    defaultMessage: 'Event JSON',
  },
  activityJson: {
    id: 'timeline.activity.json',
    defaultMessage: 'Activity JSON',
  },
  eventJsonModalOkText: {
    id: 'timeline.activity.event.json.modal.ok.text',
    defaultMessage: 'Close',
  },
  activityJsonModalOkText: {
    id: 'timeline.activity.json.modal.ok.text',
    defaultMessage: 'Close',
  },
  less: {
    id: 'timeline.activity.events.less',
    defaultMessage: 'Less',
  },
  empty: {
    id: 'timeline.activity.events.empty',
    defaultMessage: 'empty',
  },
  submit: {
    id: 'timeline.actionbar.modal.submit',
    defaultMessage: 'Submit',
  },
  return: {
    id: 'timeline.actionbar.modal.return',
    defaultMessage: 'Return',
  },
  userPoint: {
    id: 'timeline.actionbar.modal.userpoint',
    defaultMessage: 'User Point Id',
  },
  vectorId: {
    id: 'timeline.actionbar.modal.vector',
    defaultMessage: 'Vector Id',
  },
  emailHash: {
    id: 'timeline.actionbar.modal.email',
    defaultMessage: 'Email Hash',
  },
  day: {
    id: 'timeline.activity.visit.duration.day',
    defaultMessage: 'days',
  },
  hours: {
    id: 'timeline.activity.visit.duration.hours',
    defaultMessage: 'hours',
  },
  minutes: {
    id: 'timeline.activity.visit.duration.minutes',
    defaultMessage: 'minutes',
  },
  seconds: {
    id: 'timeline.activity.visit.duration.seconds',
    defaultMessage: 'seconds',
  },
  viewEventJson: {
    id: 'timeline.event.activity.view.json.button',
    defaultMessage: 'View JSON source',
  },
  viewActivityJson: {
    id: 'timeline.activity.view.json.button',
    defaultMessage: 'View JSON source',
  },
  pleaseFillInformations: {
    id: 'timeline.no.cookie.please.fill.infos',
    defaultMessage:
      'There is no user linked to your browser, please select a user to continue',
  },
  userScenarioStartContent: {
    id: 'timeline.activity.scenario.start.content',
    defaultMessage: 'Entered {scenarioName}',
  },
  userScenarioStopContent: {
    id: 'timeline.activity.scenario.stop.content',
    defaultMessage: 'Exited {scenarioName}',
  },
  userScenarioNodeEnterContent: {
    id: 'timeline.activity.scenario.node.enter.content',
    defaultMessage: 'Entered {scenarioNodeName} node within {scenarioName}',
  },
  userScenarioNodeExitContent: {
    id: 'timeline.activity.scenario.node.exit.content',
    defaultMessage: 'Exited {scenarioNodeName} node within {scenarioName}',
  },
  userScenarioNodeMovementContent: {
    id: 'timeline.activity.scenario.node.movement.content',
    defaultMessage:
      'Moved from {scenarioOldNodeName} to {scenarioNodeName} within {scenarioName}',
  },
  userActivationClickers: {
    id: 'segment.dashboard.useractivation.clickers',
    defaultMessage: '{audienceSegmentName} - Clickers'
  },
  userActivationExposed: {
    id: 'segment.dashboard.useractivation.exposed',
    defaultMessage: '{audienceSegmentName} - Exposed'
  }
});

export default messages;
