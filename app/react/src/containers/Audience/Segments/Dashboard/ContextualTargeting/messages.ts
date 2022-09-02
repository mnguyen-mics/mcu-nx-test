import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  noContextualTargetingTabText: {
    id: 'audience.segment.dashboard.contextualTargeting.noContextualTargetingTabText',
    defaultMessage: 'Target this segment using content visited by its users',
  },
  noContextualTargetingTabButton: {
    id: 'audience.segment.dashboard.contextualTargeting.noContextualTargetingTabButton',
    defaultMessage: 'Start content analysis on this segment',
  },
  InitializationTabText: {
    id: 'audience.segment.dashboard.contextualTargeting.InitializationTabText',
    defaultMessage: 'We are analyzing content visited by users in this segment',
  },
  InitializationTabSubText: {
    id: 'audience.segment.dashboard.contextualTargeting.InitializationTabSubText',
    defaultMessage: 'We will refresh this page when this is done',
  },
  stepOneTitle: {
    id: 'audience.segment.dashboard.contextualTargeting.stepOneTitle',
    defaultMessage: 'Analyze content',
  },
  stepTwoTitle: {
    id: 'audience.segment.dashboard.contextualTargeting.stepTwoTitle',
    defaultMessage: 'Select targeted ratio',
  },
  stepThreeTitle: {
    id: 'audience.segment.dashboard.contextualTargeting.stepThreeTitle',
    defaultMessage: 'Activate on your channels',
  },
  noUrls: {
    id: 'audience.segment.dashboard.contextualTargeting.noUrls',
    defaultMessage: 'There is no URLs',
  },
  id: {
    id: 'audience.segment.dashboard.contextualTargeting.id',
    defaultMessage: 'Id',
  },
  content: {
    id: 'audience.segment.dashboard.contextualTargeting.content',
    defaultMessage: 'Content',
  },
  lift: {
    id: 'audience.segment.dashboard.contextualTargeting.lift',
    defaultMessage: 'Lift',
  },
  settings: {
    id: 'audience.segment.dashboard.contextualTargeting.settings',
    defaultMessage: 'Settings',
  },
  archived: {
    id: 'audience.segment.dashboard.contextualTargeting.archived',
    defaultMessage: 'Archive those settings',
  },
  numberOfEvents: {
    id: 'audience.segment.dashboard.contextualTargeting.numberOfEvents',
    defaultMessage: 'Number of page views',
  },
  targetedRatio: {
    id: 'audience.segment.dashboard.contextualTargeting.targetedRatio',
    defaultMessage: 'Targeted page views ratio',
  },
  numberOfTargetedContent: {
    id: 'audience.segment.dashboard.contextualTargeting.numberOfTargetedContent',
    defaultMessage: 'Targeted Content',
  },
  targetedVolume: {
    id: 'audience.segment.dashboard.contextualTargeting.targetedVolume',
    defaultMessage: '30-day page views',
  },
  settingsCardButtonActivation: {
    id: 'audience.segment.dashboard.contextualTargeting.settingsCardButtonActivation',
    defaultMessage: 'Activate those settings',
  },
  settingsCardButtonEdition: {
    id: 'audience.segment.dashboard.contextualTargeting.settingsCardButtonEdition',
    defaultMessage: 'Edit those settings',
  },
  settingsCardButtonInProgress: {
    id: 'audience.segment.dashboard.contextualTargeting.settingsCardButtonInProgress',
    defaultMessage: 'Activation in progress',
  },
  targetedContentTab: {
    id: 'audience.segment.dashboard.contextualTargeting.targetedContentTab',
    defaultMessage: 'Targeted content',
  },
  semanticAnalysisTab: {
    id: 'audience.segment.dashboard.contextualTargeting.semanticAnalysisTab',
    defaultMessage: 'Semantic analysis',
  },
  category: {
    id: 'audience.segment.dashboard.contextualTargeting.category',
    defaultMessage: 'Category',
  },
  score: {
    id: 'audience.segment.dashboard.contextualTargeting.score',
    defaultMessage: 'Score',
  },
  liftRefreshTooltip: {
    id: 'audience.segment.dashboard.contextualTargeting.targetedContentTab.liftRefreshTooltip',
    defaultMessage:
      'Targeted content is live updated when editing settings (lift & targeted content ratio). Lift value is recalculated every night.',
  },
  signatureRefreshTooltip: {
    id: 'audience.segment.dashboard.contextualTargeting.semanticAnalysisTab.signatureRefreshTooltip',
    defaultMessage: 'Semantic analysis of targeted content is recalculated every night.',
  },
});
