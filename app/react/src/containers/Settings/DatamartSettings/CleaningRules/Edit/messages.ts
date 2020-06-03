import { defineMessages } from 'react-intl';

export default defineMessages({
  userEventBreadcrumbTitle: {
    id: 'settings.cleaningRules.userEvent.form.settings',
    defaultMessage: 'User Event Cleaning Rule',
  },
  userProfileBreadcrumbTitle: {
    id: 'settings.cleaningRules.userProfile.form.settings',
    defaultMessage: 'User Profile Cleaning Rule',
  },
  errorFormMessage: {
    id: 'settings.cleaningRules.userEvent.form.errorMessage',
    defaultMessage:
      'There is an error with the data you have inputed. Please check.',
  },
  sectionActionTitle: {
    id: 'settings.cleaningRules.form.action.title',
    defaultMessage: 'Action',
  },
  sectionActionUserEventSubTitle: {
    id: 'settings.cleaningRules.userEvent.form.action.subtitle',
    defaultMessage:
      'Define if your Cleaning Rule will keep or delete the user events in scope after the configured Duration.',
  },
  sectionActionUserProfileSubTitle: {
    id: 'settings.cleaningRules.userProfile.form.action.subtitle',
    defaultMessage:
      'Define if your Cleaning Rule will keep or delete the User Activities & User Events in scope.',
  },
  sectionActionLabel: {
    id: 'settings.cleaningRules.form.action.label',
    defaultMessage: 'Action',
  },
  sectionActionUserEventHelper: {
    id: 'settings.cleaningRules.userEvent.form.action.helper',
    defaultMessage:
      'DELETE: the events in scope will expire and be deleted after the configured duration. KEEP: the cleaning rule will preserve the events  in scope from deletion for the configured duration.',
  },
  sectionActionUserProfileHelper: {
    id: 'settings.cleaningRules.userProfile.form.action.helper',
    defaultMessage:
      'DELETE: the profiles in scope will expire and be deleted after the configured duration. KEEP: Not available for User Profile Cleaning Rules.',
  },
  sectionScopeTitle: {
    id: 'settings.cleaningRules.form.scope.title',
    defaultMessage: 'Scope',
  },
  sectionScopeUserEventSubTitle: {
    id: 'settings.cleaningRules.userEvent.form.scope.subtitle',
    defaultMessage:
      'Define the scope of the Cleaning Rule using three optional filters : Activity Type, Channel and Event name.',
  },
  sectionScopeUserProfileSubTitle: {
    id: 'settings.cleaningRules.userProfile.form.scope.subtitle',
    defaultMessage:
      'Define the scope of the Cleaning Rule using an optional Compartment filter.',
  },
  sectionScopeActivityTypeLabel: {
    id: 'settings.cleaningRules.userEvent.form.scope.activityType.label',
    defaultMessage: 'Activity Type Filter',
  },
  sectionScopeActivityTypeHelper: {
    id: 'settings.cleaningRules.userEvent.form.scope.activityType.helper',
    defaultMessage:
      'This filter can be used to target User Events embedded in a particular type of User Activity (field $type of the User Activity).',
  },
  sectionScopeChannelLabel: {
    id: 'settings.cleaningRules.userEvent.form.scope.channel.label',
    defaultMessage: 'Channel Filter',
  },
  sectionScopeChannelHelper: {
    id: 'settings.cleaningRules.userEvent.form.scope.channel.helper',
    defaultMessage:
      'This filter can be used to target User Events related to a given channel (field $site_id or $app_id of the User Activity).',
  },
  sectionScopeEventNameLabel: {
    id: 'settings.cleaningRules.userEvent.form.scope.eventName.label',
    defaultMessage: 'Event Name Filter',
  },
  sectionScopeEventNameHelper: {
    id: 'settings.cleaningRules.userEvent.form.scope.eventName.helper',
    defaultMessage:
      'This filter can be used to target User Events with a specific name (field $event_name of the User Event).',
  },
  sectionScopeCompartmentLabel: {
    id: 'settings.cleaningRules.userProfile.form.scope.channel.label',
    defaultMessage: 'Compartment Filter',
  },
  sectionScopeCompartmentHelper: {
    id: 'settings.cleaningRules.userProfile.form.scope.channel.helper',
    defaultMessage:
      'This filter can be used to target User Profiles related to a given user account compartment.',
  },
  sectionDatamartTitle: {
    id: 'settings.cleaningRules.form.datamart.title',
    defaultMessage: 'Datamart',
  },
  saveUserEventCleaningRule: {
    id: 'settings.cleaningRules.userEvent.form.saveCleaningRule',
    defaultMessage: 'Save User Event Cleaning Rule',
  },
  saveUserProfileCleaningRule: {
    id: 'settings.cleaningRules.userProfile.form.saveCleaningRule',
    defaultMessage: 'Save User Profile Cleaning Rule',
  },
  invalidLifeDuration: {
    id: 'settings.cleaningRules.form.invalidLifeDuration',
    defaultMessage: 'Invalid life duration',
  },
  cleaningRuleLifeDurationDays: {
    id: 'settings.cleaningRules.form.cleaningRuleLifeDurationDays',
    defaultMessage: 'Days',
  },
});
