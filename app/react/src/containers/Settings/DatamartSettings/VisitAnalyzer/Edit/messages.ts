import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'visitanalyzer.edit.list.title',
    defaultMessage: 'Visit Analyzers',
  },
  listSubTitle: {
    id: 'visitanalyzer.edit.list.subtitle',
    defaultMessage: 'New Visit Analyzer',
  },
  visitAnalyzerBreadcrumb: {
    id: 'visitanalyzer.create.breadcrumb.newtitle',
    defaultMessage: 'New Visit Analyzer',
  },
  visitAnalyzerEditBreadcrumb: {
    id: 'visitanalyzer.create.breadcrumb.editTitle',
    defaultMessage: 'Edit {name}',
  },
  sectionGeneralErrorRecoveryStrategy: {
    id: 'plugin.edit.section.general.button.error-recovery-strategy',
    defaultMessage: 'Error Recovery Strategy',
  },
  sectionGeneralErrorRecoveryStrategyHelper: {
    id: 'plugin.edit.section.general.button.error-recovery-strategy-helper',
    defaultMessage:
      'Store With Error Id: If the Visit Analyzer failed, the activity will be sent to the next Visit Analyzer without any modification of this one. Store With Error Id And Skip Upcoming Analyzers: If the Visit Analyzer failed, the activity will be saved without any modification of this one. Drop: If the Visit Analyzer failed, the activity won’t be saved.',
  },
});
