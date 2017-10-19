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
  contentSection1Row1Label: {
    id: 'campaignEditor.section1.row1.label',
    defaultMessage: 'Campaign Name',
  },
  contentSection1Row1Placeholder: {
    id: 'campaignEditor.section1.row1.placeholder',
    defaultMessage: 'Campaign Name',
  },
  contentSection1Row1Tooltip: {
    id: 'campaignEditor.section1.row1.tooltip',
    defaultMessage: 'The campaign\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  },

   /* Advanced part */

  contentSection1AdvancedPartTitle: {
    id: 'campaignEditor.section1.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  /* Row 2 */
  contentSection1Row5Label: {
    id: 'campaignEditor.section1.row5.label',
    defaultMessage: 'Technical Name',
  },
  contentSection1Row5Placeholder: {
    id: 'campaignEditor.section1.row5.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSection1Row5Tooltip: {
    id: 'campaignEditor.section1.row5.tooltip',
    defaultMessage: 'Use the Technical Name for custom integration with other DSPs',
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
