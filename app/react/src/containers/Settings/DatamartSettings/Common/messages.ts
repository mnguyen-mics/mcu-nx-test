import { defineMessages } from 'react-intl';

export default defineMessages({
  dropdownAddProcessingActivity: {
    id: 'settings.datamart.processings.section.add',
    defaultMessage: 'Add Processing Activity',
  },
  processingActivitiesSectionSubtitle: {
    id: 'settings.datamart.processings.section.subtitle',
    defaultMessage:
      'Select the Processing Activities on behalf of which you are capturing personal data on this channel. mediarithmics platform will automatically check the related User Choices before storing the captured data.',
  },
  processingActivitiesSectionTitle: {
    id: 'settings.datamart.processings.section.title',
    defaultMessage: 'Privacy Wall - Processing Activities',
  },
  processingActivitiesEmptySection: {
    id: 'settings.datamart.processings.section.empty',
    defaultMessage: 'There is no Processing Activity selected yet!',
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
  warningProcessingActivities: {
    id: 'settings.datamart.processings.warning',
    defaultMessage:
      'Danger Zone: When you link a Channel to a Processing Activity, the platform allows the storage of User Events if and only if the User Choices allow it. Therefore, to avoid unwanted data loss, you must be sure that User Choices are captured properly before doing so.',
  },
});
