import { defineMessages } from 'react-intl';

export default defineMessages({
  saveAdGroup: {
    id: 'message.submit.campaign',
    defaultMessage: 'Save',
  },
  breadcrumbTitle1: {
    id: 'campaignEditor.breadcrumb.title',
    defaultMessage: 'Display',
  },
  /*
  ==============================================================================
  =============================== DROPDOWN OPTIONS =============================
  ==============================================================================
  */
  dropdownNew: {
    id: 'campaignEditor.dropdown.new',
    defaultMessage: 'New',
  },
  dropdownAdd: {
    id: 'campaignEditor.dropdown.add',
    defaultMessage: 'Add',
  },
  dropdownAddExisting: {
    id: 'campaignEditor.dropdown.addExisting',
    defaultMessage: 'Add existing',
  },
  /*
  ==============================================================================
  ================================ SECTION TITLES ==============================
  ==============================================================================
  */
  sectionTitle1: {
    id: 'campaignEditor.section.title1',
    defaultMessage: 'General Information',
  },
  sectionTitle2: {
    id: 'campaignEditor.section.title2',
    defaultMessage: 'Goals',
  },
  sectionTitle3: {
    id: 'campaignEditor.section.title3',
    defaultMessage: 'Ad Groups',
  },

  /*
  ==============================================================================
  ============================== SECTION SUBTITLES =============================
  ==============================================================================
  */
  sectionSubtitle1: {
    id: 'campaignEditor.section.subtitle1',
    defaultMessage: 'Give your Campaign a name.',
  },
  sectionSubtitle2: {
    id: 'campaignEditor.section.subtitle2',
    defaultMessage: 'Create a Goal that reflects your campaign objectives. You will get a pixel code afterwards to track who has converted to your goal.',
  },
  sectionSubtitle3: {
    id: 'campaignEditor.section.subtitle3',
    defaultMessage: 'Create one or severals Ad Groups. An Ad Group is basically a Campaign Strategy that has its own Budget, and targeting.',
  },

  /*
  ==============================================================================
  ============================== SECTIONS CONTENT ==============================
  ==============================================================================
  */

  /* Row 1 */
  contentSectionGeneralRow1Label: {
    id: 'campaignEditor.section.general.row1.label',
    defaultMessage: 'Campaign Name',
  },
  contentSectionGeneralRow1Placeholder: {
    id: 'campaignEditor.section.general.row1.placeholder',
    defaultMessage: 'Campaign Name',
  },
  contentSectionGeneralRow1Tooltip: {
    id: 'campaignEditor.section.general.row1.tooltip',
    defaultMessage: 'The campaign\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  },

   /* Advanced part */

  contentSectionGeneralAdvancedPartTitle: {
    id: 'campaignEditor.section.general.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  /* Row 2 */
  contentSectionGeneralAdvancedPartRow1Label: {
    id: 'campaignEditor.section1.advancedPart.row1.label',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Placeholder: {
    id: 'campaignEditor.section1.advancedPart.row1.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Tooltip: {
    id: 'campaignEditor.section1.advancedPart.row1.tooltip',
    defaultMessage: 'Use the Technical Name for custom integration with other DSPs',
  },

  /* Row 3 */
  contentSectionGeneralAdvancedPartRow2Label: {
    id: 'campaignEditor.section1.advancedPart.row2.label',
    defaultMessage: 'Total Impression Capping',
  },
  contentSectionGeneralAdvancedPartRow2Placeholder: {
    id: 'campaignEditor.section1.advancedPart.row2.placeholder',
    defaultMessage: '10',
  },
  contentSectionGeneralAdvancedPartRow2Tooltip: {
    id: 'campaignEditor.section1.advancedPart.row2.tooltip',
    defaultMessage: 'The capping is at the device level, if you don\'t want any capping set it to 0',
  },

  /* Row 4 */
  contentSectionGeneralAdvancedPartRow3Label: {
    id: 'campaignEditor.section1.advancedPart.row3.label',
    defaultMessage: 'Daily Impression Capping',
  },
  contentSectionGeneralAdvancedPartRow3Placeholder: {
    id: 'campaignEditor.section1.advancedPart.row3.placeholder',
    defaultMessage: '1',
  },
  contentSectionGeneralAdvancedPartRow3Tooltip: {
    id: 'campaignEditor.section1.advancedPart.row3.tooltip',
    defaultMessage: 'The capping is at the device level, if you don\'t want any capping set it to 0',
  },

  /* Row 4 */
  contentSectionGeneralAdvancedPartRow4Label: {
    id: 'campaignEditor.section1.advancedPart.row4.label',
    defaultMessage: 'Total Budget',
  },
  contentSectionGeneralAdvancedPartRow4Placeholder: {
    id: 'campaignEditor.section1.advancedPart.row4.placeholder',
    defaultMessage: '500',
  },
  contentSectionGeneralAdvancedPartRow4Tooltip: {
    id: 'campaignEditor.section1.advancedPart.row4.tooltip',
    defaultMessage: 'Define the total budget of your campaign.',
  },

   /* Row 5 */
  contentSectionGeneralAdvancedPartRow5Label: {
    id: 'campaignEditor.section1.advancedPart.row5.label',
    defaultMessage: 'Budget Split',
  },
  contentSectionGeneralAdvancedPartRow5Placeholder: {
    id: 'campaignEditor.section1.advancedPart.row5.placeholder',
    defaultMessage: '500',
  },
  contentSectionGeneralAdvancedPartRow5Tooltip: {
    id: 'campaignEditor.section1.advancedPart.row5.tooltip',
    defaultMessage: 'Define the budget split of your campaign.',
  },

  contentSectionGeneralRow5OptionDAY: {
    id: 'adGroupEditor.section.general.row5.optionDAY',
    defaultMessage: 'Per Day',
  },
  contentSectionGeneralRow5OptionWEEK: {
    id: 'adGroupEditor.section.general.row5.optionWEEK',
    defaultMessage: 'Per Week',
  },
  contentSectionGeneralRow5OptionMONTH: {
    id: 'adGroupEditor.section.general.row5.option1MONTH',
    defaultMessage: 'Per Month',
  },

  /* ------------------------------- SECTION 2 ------------------------------ */

  contentSection2Medium1: {
    id: 'campaignEditor.section2.medium1',
    defaultMessage: 'Post View',
  },
  contentSection2Medium2: {
    id: 'campaignEditor.section2.medium2',
    defaultMessage: 'Post Click',
  },
  contentSection2EmptyTitle: {
    id: 'campaignEditor.section2.emptyTitle',
    defaultMessage: 'Click on the pen to add a Goal to your Campaign',
  },

  /* ------------------------------- SECTION 2 ------------------------------ */

  contentSection3EmptyTitle: {
    id: 'campaignEditor.section3.emptyTitle',
    defaultMessage: 'Click on the pen to add an Ad Group to your Campaign',
  },


});
