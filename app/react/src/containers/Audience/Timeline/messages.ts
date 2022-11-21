import { defineMessages, MessageDescriptor } from 'react-intl';

const messages: {
  [propertyName: string]: MessageDescriptor;
} = defineMessages({
  lookUpUser: {
    id: 'audience.monitoring.timeline.actionbar.lookup',
    defaultMessage: 'User Lookup',
  },
  viewMore: {
    id: 'audience.monitoring.timeline.content.viewMore',
    defaultMessage: 'View More',
  },
  viewLess: {
    id: 'audience.monitoring.timeline.content.viewLess',
    defaultMessage: 'View Less',
  },
  visitor: {
    id: 'audience.monitoring.timeline.content.header.visitor',
    defaultMessage: 'Visitor',
  },
  activities: {
    id: 'audience.monitoring.timeline.content.header.activities',
    defaultMessage: 'Activities',
  },
  identifiers: {
    id: 'audience.monitoring.timeline.content.header.identifiers',
    defaultMessage: 'Identifiers',
  },
  profileTitle: {
    id: 'audience.monitoring.timeline.card.profile.title',
    defaultMessage: 'Profile',
  },
  emptyProfile: {
    id: 'audience.monitoring.audience.monitoring.timeline.card.profile.empty',
    defaultMessage: 'This user has no Profile Information',
  },
  segmentTitle: {
    id: 'audience.monitoring.timeline.card.segment.title',
    defaultMessage: 'Segments',
  },
  emptySegment: {
    id: 'audience.monitoring.timeline.card.segment.empty',
    defaultMessage: 'This user has no Segment Information',
  },
  accountTitle: {
    id: 'audience.monitoring.timeline.card.account.title',
    defaultMessage: 'User Account Id',
  },
  unknownCompartmentName: {
    id: 'audience.monitoring.timeline.card.user.account.unknown.compartment.name',
    defaultMessage: 'Unknown compartment name',
  },
  emptyAccount: {
    id: 'audience.monitoring.timeline.card.account.empty',
    defaultMessage: 'This user has no Account Information',
  },
  deviceTitle: {
    id: 'audience.monitoring.timeline.card.device.title',
    defaultMessage: 'User Device',
  },
  emptyDevice: {
    id: 'audience.monitoring.timeline.card.device.empty',
    defaultMessage: 'This user has no Devices',
  },
  emailTitle: {
    id: 'audience.monitoring.timeline.card.email.title',
    defaultMessage: 'User Email',
  },
  emptyEmail: {
    id: 'audience.monitoring.timeline.card.email.empty',
    defaultMessage: 'This user has no Emails',
  },
  nullEmail: {
    id: 'audience.monitoring.timeline.card.email.modal.null',
    defaultMessage: 'null',
  },
  okModalEmail: {
    id: 'audience.monitoring.timeline.card.email.modal.ok',
    defaultMessage: 'Ok',
  },
  titleModalEmail: {
    id: 'audience.monitoring.timeline.card.email.modal.title',
    defaultMessage: 'Email Information',
  },
  emailAddress: {
    id: 'audience.monitoring.timeline.card.email.modal.emailAddress',
    defaultMessage: 'Email Address',
  },
  emailCreation: {
    id: 'audience.monitoring.timeline.card.email.modal.creationdate',
    defaultMessage: 'Creation Date',
  },
  emailActivity: {
    id: 'audience.monitoring.timeline.card.email.modal.lastActivity',
    defaultMessage: 'Last Activity Date',
  },
  emailInfo: {
    id: 'audience.monitoring.timeline.card.email.modal.information',
    defaultMessage: 'Information',
  },
  emailConsent: {
    id: 'audience.monitoring.timeline.card.email.modal.consent',
    defaultMessage: 'Consent',
  },
  CREATION_TS: {
    id: 'audience.monitoring.timeline.card.email.modal.CREATION_TS',
    defaultMessage: 'Creation Date',
  },
  LAST_ACTIVITY_TS: {
    id: 'audience.monitoring.timeline.card.email.modal.LAST_ACTIVITY_TS',
    defaultMessage: 'Last Activity Date',
  },
  LAST_MODIFIED_TS: {
    id: 'audience.monitoring.timeline.card.email.modal.LAST_MODIFIED_TS',
    defaultMessage: 'Last Modified Date',
  },
  EXPIRATION_TS: {
    id: 'audience.monitoring.timeline.card.email.modal.EXPIRATION_TS',
    defaultMessage: 'Expiration Date',
  },
  TECHNICAL_NAME: {
    id: 'audience.monitoring.timeline.card.email.modal.TECHNICAL_NAME',
    defaultMessage: 'Technical Name',
  },
  ACTIVE: {
    id: 'audience.monitoring.timeline.card.email.modal.ACTIVE',
    defaultMessage: 'Active',
  },
  STATUS: {
    id: 'audience.monitoring.timeline.card.email.modal.STATUS',
    defaultMessage: 'Status',
  },
  origin: {
    id: 'audience.monitoring.timeline.card.activity.origin.title',
    defaultMessage: 'Origin',
  },
  direct: {
    id: 'audience.monitoring.timeline.card.activity.origin.direct',
    defaultMessage: 'Direct',
  },
  topics: {
    id: 'audience.monitoring.timeline.card.activity.topics.title',
    defaultMessage: 'Topics',
  },
  seeMore: {
    id: 'audience.monitoring.timeline.activities.button.viewMore',
    defaultMessage: 'See More',
  },
  noActivitiesLeft: {
    id: 'audience.monitoring.timeline.activities.button.noActivitiesLeft',
    defaultMessage: 'No Activities Left',
  },
  noActivities: {
    id: 'audience.monitoring.timeline.activities.button.noActivities',
    defaultMessage: 'No Activities for this user',
  },
  today: {
    id: 'audience.monitoring.timeline.activities.title.today',
    defaultMessage: 'Today',
  },
  yesterday: {
    id: 'audience.monitoring.timeline.activities.title.yesterday',
    defaultMessage: 'Yesterday',
  },
  lastSeen: {
    id: 'audience.monitoring.timeline.title.lastSeen',
    defaultMessage: 'Last Seen At',
  },
  monitoring: {
    id: 'audience.monitoring.timeline.title',
    defaultMessage: 'Monitoring',
  },
  detail: {
    id: 'audience.monitoring.timeline.activity.events.detail',
    defaultMessage: 'Details',
  },
  eventJson: {
    id: 'audience.monitoring.timeline.activity.events.json',
    defaultMessage: 'Event JSON',
  },
  activityJson: {
    id: 'audience.monitoring.timeline.activity.json',
    defaultMessage: 'Activity JSON',
  },
  eventJsonModalOkText: {
    id: 'audience.monitoring.timeline.activity.event.json.modal.ok.text',
    defaultMessage: 'Close',
  },
  activityJsonModalOkText: {
    id: 'audience.monitoring.timeline.activity.json.modal.ok.text',
    defaultMessage: 'Close',
  },
  less: {
    id: 'audience.monitoring.timeline.activity.events.less',
    defaultMessage: 'Less',
  },
  empty: {
    id: 'audience.monitoring.timeline.activity.events.empty',
    defaultMessage: 'empty',
  },
  submit: {
    id: 'audience.monitoring.timeline.actionbar.modal.submit',
    defaultMessage: 'Submit',
  },
  return: {
    id: 'audience.monitoring.timeline.actionbar.modal.return',
    defaultMessage: 'Return',
  },
  userPoint: {
    id: 'audience.monitoring.timeline.actionbar.modal.userpoint',
    defaultMessage: 'User Point Id',
  },
  vectorId: {
    id: 'audience.monitoring.timeline.actionbar.modal.vector',
    defaultMessage: 'Vector Id',
  },
  emailHash: {
    id: 'audience.monitoring.timeline.actionbar.modal.email',
    defaultMessage: 'Email Hash',
  },
  day: {
    id: 'audience.monitoring.timeline.activity.visit.duration.day',
    defaultMessage: 'days',
  },
  hours: {
    id: 'audience.monitoring.timeline.activity.visit.duration.hours',
    defaultMessage: 'hours',
  },
  minutes: {
    id: 'audience.monitoring.timeline.activity.visit.duration.minutes',
    defaultMessage: 'minutes',
  },
  seconds: {
    id: 'audience.monitoring.timeline.activity.visit.duration.seconds',
    defaultMessage: 'seconds',
  },
  viewEventJson: {
    id: 'audience.monitoring.timeline.event.activity.view.json.button',
    defaultMessage: 'View JSON source',
  },
  viewActivityJson: {
    id: 'audience.monitoring.timeline.activity.view.json.button',
    defaultMessage: 'View JSON source',
  },
  pleaseFillInformations: {
    id: 'audience.monitoring.timeline.no.cookie.please.fill.infos',
    defaultMessage: 'There is no user linked to your browser, please select a user to continue',
  },
  userScenarioStartTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.start.title',
    defaultMessage: 'Scenario Start',
  },
  userScenarioStopTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.stop.title',
    defaultMessage: 'Scenario Stop',
  },
  userScenarioStopOnExitConditionTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.stop.on.exit.condition.title',
    defaultMessage: 'Scenario Stop on Exit Condition',
  },
  userScenarioNodeEnterTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.node.enter.title',
    defaultMessage: 'Scenario Node Enter',
  },
  userScenarioNodeExitTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.node.exit.title',
    defaultMessage: 'Scenario Node Exit',
  },
  userScenarioNodeMovementTitle: {
    id: 'audience.monitoring.timeline.activity.scenario.node.movement.title',
    defaultMessage: 'Scenario Node Movement',
  },
  userScenarioStartContent: {
    id: 'audience.monitoring.timeline.activity.scenario.start.content',
    defaultMessage: 'Entered {scenarioName}',
  },
  userScenarioStopContent: {
    id: 'audience.monitoring.timeline.activity.scenario.stop.content',
    defaultMessage: 'Exited {scenarioName}',
  },
  userScenarioNodeEnterContent: {
    id: 'audience.monitoring.timeline.activity.scenario.node.enter.content',
    defaultMessage: 'Entered {scenarioNodeName} node within {scenarioName}',
  },
  userScenarioNodeExitContent: {
    id: 'audience.monitoring.timeline.activity.scenario.node.exit.content',
    defaultMessage: 'Exited {scenarioNodeName} node within {scenarioName}',
  },
  userScenarioNodeMovementContent: {
    id: 'audience.monitoring.timeline.activity.scenario.node.movement.content',
    defaultMessage: 'Moved from {scenarioOldNodeName} to {scenarioNodeName} within {scenarioName}',
  },
  userChoicesTitle: {
    id: 'audience.monitoring.timeline.card.userChoices.title',
    defaultMessage: 'User Choices',
  },
  userChoicesviewJsonButton: {
    id: 'audience.monitoring.timeline.card.userChoices.viewJsonButton',
    defaultMessage: 'View JSON source',
  },
  userChoicesJson: {
    id: 'audience.monitoring.timeline.card.userChoices.json',
    defaultMessage: 'User Choices JSON',
  },
  userChoicesJsonModalOkText: {
    id: 'audience.monitoring.timeline.card.userChoices.json.modal.ok.text',
    defaultMessage: 'Close',
  },
  emptyUserChoices: {
    id: 'audience.monitoring.timeline.card.userChoices.empty',
    defaultMessage: 'This user has no User Choices',
  },
});

export default messages;
