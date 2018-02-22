import { defineMessages } from 'react-intl';

export default defineMessages({
  audienceSegmentBreadCrumb: {
    id: 'audience.segment.actionbar.breadcrumb.label',
    defaultMessage: 'New Audience Segment',
  },
  audienceSegmentSaveButton: {
    id: 'audience.segment.create.actionbar.button.save',
    defaultMessage: 'Save',
  },
  audienceSegmentSiderMenuSemgnetType: {
    id: 'segment.sider.menu.SegmentType',
    defaultMessage: 'Segment Type'
  },
  audienceSegmentSiderMenuGeneralInformation: {
    id: 'segment.sider.menu.generalInformation',
    defaultMessage: 'General Information'
  },
  audienceSegmentSiderMenuProperties: {
    id: 'segment.sider.menu.properties',
    defaultMessage: 'Properties'
  },
  audienceSegmentSectionGeneralTitle: {
    id: 'audience.segment.create.section.general.title',
    defaultMessage: 'General Information',
  },
  audienceSegmentSectionGeneralSubTitle: {
    id: 'audience.segment.create.section.general.subtitle',
    defaultMessage: 'Give your Audience Segment a name.',
  },
  audienceSegmentSectionQueryTitle: {
    id: 'audience.segment.create.section.query.title',
    defaultMessage: 'User Query',
  },
  audienceSegmentSectionQuerySubTitle: {
    id: 'audience.segment.create.section.query.subtitle',
    defaultMessage: 'Select the user you want to add to your segment.',
  },
  audienceSegmentCreationGeneralNameFieldTitle: {
    id: 'audience.segment.create.section.general.field.name.title',
    defaultMessage: 'Name',
  },
  audienceSegmentCreationGeneralNameFieldPlaceHolder: {
    id: 'audience.segment.create.section.general.field.name.placeholder',
    defaultMessage: 'Audience Segment Name',
  },
  audienceSegmentCreationGeneralNameFieldHelper: {
    id: 'audience.segment.create.section.general.field.name.helper',
    defaultMessage: 'Give your Audience Segment a name!',
  },
  // Technical name
  contentSectionGeneralAdvancedPartRow1Label: {
    id: 'audience.segment.section1.advancedPart.row1.label',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Placeholder: {
    id: 'audience.segment.section1.advancedPart.row1.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Tooltip: {
    id: 'audience.segment.section1.advancedPart.row1.tooltip',
    defaultMessage: 'Use the Technical Name for custom integration',
  },
  // Code snippet
  contentSectionPropertiesPartRow1Label: {
    id: 'audience.segment.section2.row1.label',
    defaultMessage: 'Code Snippet',
  },
  contentSectionPropertiesPartRow1Placeholder: {
    id: 'audience.segment.section2.row1.placeholder',
    defaultMessage: 'Code Snippet',
  },
  contentSectionPropertiesPartRow1Tooltip: {
    id: 'audience.segment.section2advancedPart.row1.tooltip',
    defaultMessage: 'The code snippet to copy on your web page for custom intergration',
  },
  contentSectionPropertiesPartRow1TooltipHover: {
    id: 'audience.segment.section2advancedPart.row1.tooltiphover',
    defaultMessage: 'Click to copy',
  },
  contentSectionPropertiesPartRow1TooltipSnippetCopied: {
    id: 'audience.segment.section2advancedPart.row1.codesnippetcopied',
    defaultMessage: 'Code snippet copied',
  },
  // Default lifetime
  contentSectionGeneralAdvancedPartRow2Label: {
    id: 'audience.segment.section1.advancedPart.row2.label',
    defaultMessage: 'Default lifetime',
  },
  contentSectionGeneralAdvancedPartRow2Placeholder: {
    id: 'audience.segment.section1.advancedPart.row2.placeholder',
    defaultMessage: 'Default lifetime',
  },
  contentSectionGeneralAdvancedPartRow2Tooltip: {
    id: 'audience.segment.section1.advancedPart.row2.tooltip',
    defaultMessage: 'Use the Default lifetime expiration',
  },

  contentSectionGeneralRow4OptionExpiresIn: {
    id: 'audience.segment.section1.advancedPart.row4.ExpiresIn',
    defaultMessage: 'Expires In',
  },
  contentSectionGeneralRow5OptionDAY: {
    id: 'audience.segment.section1.advancedPart.row5.optionDAY',
    defaultMessage: 'Days',
  },
  contentSectionGeneralRow5OptionWEEK: {
    id: 'audience.segment.section1.advancedPart.row5.optionWEEK',
    defaultMessage: 'Weeks',
  },
  contentSectionGeneralRow5OptionMONTH: {
    id: 'audience.segment.section1.advancedPart.row5.optionMONTH',
    defaultMessage: 'Months',
  },
  contentSectionGeneralAdvancedPartTitle: {
    id: 'campaignEditor.section.general.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  errorFormMessage: {
    id: 'audience.segment.error',
    defaultMessage: 'There is an error with some fields in your form. Please review the data you entered.',
  },

  savingInProgress: {
    id: 'form.saving.in.progress',
    defaultMessage: 'Saving in progress',
  },

  addExisting: {
    id: 'audience.segment.addExisting',
    defaultMessage: 'Add Existing',
  },
  sectionAudienceExternalFeedTitle: {
    id: 'audience.segment.audienceexternalfeed.title',
    defaultMessage: 'Audience External Feeds',
  },
  sectionAudienceExternalFeedSubtitle: {
    id: 'audience.segment.audienceexternalfeed.subtitle',
    defaultMessage: 'Add an Audience External Feed to push your segment to third party. An Audience External Feed is a Server to Server mean to push a segment to a third party receiver.',
  },
  sectionEmptyAudienceExternalFeedRules: {
    id: 'audience.segment.audienceexternalfeed.empty',
    defaultMessage: 'No Audience External Feed selected yet!',
  },
  sectionAudienceTagFeedTitle: {
    id: 'audience.segment.audiencetagfeed.title',
    defaultMessage: 'Audience Tag Feeds',
  },
  sectionAudienceTagFeedSubtitle: {
    id: 'audience.segment.audiencetagfeed.subtitle',
    defaultMessage: 'Add an Audience Tag Feed to push your segment to third party. An Audience Tag Feed will trigger a pixel on your properties to push a segment to a third party receiver.',
  },
  sectionEmptyAudienceTagFeedRules: {
    id: 'audience.segment.audiencetagfeed.empty',
    defaultMessage: 'No Audience Tag Feed selected yet!',
  },
  listTagTitle: {
    id: 'audience.segment.audiencetagfeed.list.title',
    defaultMessage: 'Choose your Audience Tag Feed Type',
  },
  listTagSubTitle: {
    id: 'audience.segment.audiencetagfeed.list.subtitle',
    defaultMessage: 'Add an Audience Tag Feed. An Audience Tag feed will trigger a pixel on your properties to push cookies to third parties receivers.',
  },
  listExternalTitle: {
    id: 'audience.segment.audienceexternalfeed.list.title',
    defaultMessage: 'Choose your Audience External Feed Type',
  },
  listExternalSubTitle: {
    id: 'audience.segment.audienceexternalfeed.list.subtitle',
    defaultMessage: 'Add an Audience External Feed. An Audience External feed will push cookies (Server to Server) to third parties receivers.',
  }
});
