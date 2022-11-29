import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'activityanalyzer.edit.list.title',
    defaultMessage: 'Activity Analyzers',
  },
  listSubTitle: {
    id: 'activityanalyzer.edit.list.subtitle',
    defaultMessage: 'New Activity Analyzer',
  },
  visitAnalyzerBreadcrumb: {
    id: 'activityanalyzer.create.breadcrumb.newtitle',
    defaultMessage: 'New Activity Analyzer',
  },
  visitAnalyzerEditBreadcrumb: {
    id: 'activityanalyzer.create.breadcrumb.editTitle',
    defaultMessage: 'Edit {name}',
  },
  sectionGeneralErrorRecoveryStrategy: {
    id: 'plugin.edit.section.general.button.error-recovery-strategy',
    defaultMessage: 'Error Recovery Strategy',
  },
  sectionGeneralErrorRecoveryStrategyHelper: {
    id: 'plugin.edit.section.general.button.error-recovery-strategy-helper',
    defaultMessage:
      'Store With Error Id: If the Activity Analyzer failed, the activity will be sent to the next Activity Analyzer without any modification of this one. Store With Error Id And Skip Upcoming Analyzers: If the Activity Analyzer failed, the activity will be saved without any modification of this one. Drop: If the Activity Analyzer failed, the activity won’t be saved.',
  },
});
