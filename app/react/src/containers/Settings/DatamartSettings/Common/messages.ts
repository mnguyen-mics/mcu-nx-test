import { defineMessages } from 'react-intl';

export default defineMessages({
  dropdownAddProcessingActivity: {
    id: 'settings.datamart.processings.section.add',
    defaultMessage: 'Add Processing Activity',
  },
  processingActivitiesForChannelsSectionSubtitle: {
    id: 'settings.datamart.processings.forChannels.section.subtitle',
    defaultMessage:
      'Select the Processing Activities on behalf of which you are capturing personal data on this channel. mediarithmics platform will automatically check the related User Choices before storing the captured data.',
  },
  processingActivitiesForCompartmentsSectionSubtitle: {
    id: 'settings.datamart.processings.forCompartments.section.subtitle',
    defaultMessage:
      'Select the Processing Activities on behalf of which you are capturing personal data on this compartment. mediarithmics platform will automatically check the related User Choices before storing the captured data.',
  },
  processingActivitiesForSegmentsSectionSubtitle: {
    id: 'settings.datamart.processings.forSegments.section.subtitle',
    defaultMessage:
      'Select the Processing Activities on behalf of which you are creating this audience segment. mediarithmics platform will automatically take the related User Choices into account to include or exclude them from the segment.',
  },
  processingActivitiesForChannelsOrCompartmentsSectionTitle: {
    id: 'settings.datamart.processings.forChannelsOrCompartments.section.title',
    defaultMessage: 'User Choices - Privacy Wall',
  },
  processingActivitiesForSegmentsSectionTitle: {
    id: 'settings.datamart.processings.forSegments.section.title',
    defaultMessage: 'User Choices',
  },
  processingActivitiesEmptySection: {
    id: 'settings.datamart.processings.section.empty',
    defaultMessage: 'There is no Processing Activity selected yet!',
  },
  processingActivitiesForEdge: {
    id: 'settings.datamart.processings.section.edge',
    defaultMessage: 'This feature is not available for Edge segments.',
  },
  processingActivitiesSelectorColumnName: {
    id: 'settings.datamart.processings.selector.columns.name',
    defaultMessage: 'Name',
  },
  processingActivitiesSelectorColumnLegalBasis: {
    id: 'settings.datamart.processings.selector.columns.legalBasis',
    defaultMessage: 'Legal Basis',
  },
  processingActivitiesSelectorTitle: {
    id: 'settings.datamart.processings.selector.title',
    defaultMessage: 'Select Processing Activities',
  },
  processingActivitiesSelectorSearchPlaceholder: {
    id: 'settings.datamart.processings.selector.search.placeholder',
    defaultMessage: 'Search Processing Activities',
  },
  warningProcessingActivitiesForChannels: {
    id: 'settings.datamart.processings.warning',
    defaultMessage:
      'Danger Zone: When you link a Channel to a Processing Activity, the platform allows the storage of User Events if and only if the User Choices allow it. Therefore, to avoid unwanted data loss, you must be sure that User Choices are captured properly before doing so.',
  },
  addToSegmentAutomationSectionSubtitle: {
    id:
      'settings.datamart.processings.forAddToSegmentAutomationNode.section.subtitle',
    defaultMessage:
      'If your segment is subject to user consent, you can automate whether or not users should be included in the segment by linking it to a Processing Activity. Processing Activities can be managed in your {organisationSettings}.',
  },
  organisationSettings: {
    id:
      'settings.datamart.processings.forAddToSegmentAutomationNode.section.subtitle.organisationSettings',
    defaultMessage: 'organisation settings',
  },
});
