import { defineMessages } from 'react-intl';

export default defineMessages({
  saveGoal: {
    id: 'message.submit.goalSimple',
    defaultMessage: 'Add Goal',
  },
  breadcrumbTitle1: {
    id: 'goalSimpleEditor.breadcrumb.title',
    defaultMessage: 'Create a new Goal',
  },
  /*
  ==============================================================================
  =============================== DROPDOWN OPTIONS =============================
  ==============================================================================
  */
  dropdownNew: {
    id: 'goalSimpleEditor.dropdown.new',
    defaultMessage: 'New',
  },
  dropdownAdd: {
    id: 'goalSimpleEditor.dropdown.add',
    defaultMessage: 'Add',
  },
  dropdownAddExisting: {
    id: 'goalSimpleEditor.dropdown.addExisting',
    defaultMessage: 'Add existing',
  },
  /*
  ==============================================================================
  ================================ SECTION TITLES ==============================
  ==============================================================================
  */
  sectionTitle1: {
    id: 'goalSimpleEditor.section.title1',
    defaultMessage: 'General Information',
  },
  sectionTitle2: {
    id: 'goalSimpleEditor.section.title2',
    defaultMessage: 'Attribution Window',
  },

  /*
  ==============================================================================
  ============================== SECTION SUBTITLES =============================
  ==============================================================================
  */
  sectionSubtitle1: {
    id: 'goalSimpleEditor.section.subtitle1',
    defaultMessage: 'Give your Goal a name.',
  },
  sectionSubtitle2: {
    id: 'goalSimpleEditor.section.subtitle2',
    defaultMessage: 'Choose your Attribution Window to get advantage of custom reporting.',
  },

  /*
  ==============================================================================
  ============================== SECTIONS CONTENT ==============================
  ==============================================================================
  */

  /* Row 1 */
  contentSection1Row1Label: {
    id: 'goalSimpleEditor.section1.row1.label',
    defaultMessage: 'Goal Name',
  },
  contentSection1Row1Placeholder: {
    id: 'goalSimpleEditor.section1.row1.placeholder',
    defaultMessage: 'Goal Name',
  },
  contentSection1Row1Tooltip: {
    id: 'goalSimpleEditor.section1.row1.tooltip',
    defaultMessage: 'The Goal\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  },

   /* Advanced part */

  contentSection1AdvancedPartTitle: {
    id: 'goalSimpleEditor.section1.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  /* Row 2 */
  contentSection1Row5Label: {
    id: 'goalSimpleEditor.section1.row5.label',
    defaultMessage: 'Technical Name',
  },
  contentSection1Row5Placeholder: {
    id: 'goalSimpleEditor.section1.row5.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSection1Row5Tooltip: {
    id: 'goalSimpleEditor.section1.row5.tooltip',
    defaultMessage: 'Use the Technical Name for custom integration with other DSPs',
  },

  /* ------------------------------- SECTION 2 ------------------------------ */

  contentSection2Row1Label: {
    id: 'goalSimpleEditor.section2.row1.label',
    defaultMessage: 'Post View',
  },
  contentSection2Row1Placeholder: {
    id: 'goalSimpleEditor.section2.row1.placeholder',
    defaultMessage: 'Post View',
  },
  contentSection2Row1Tooltip: {
    id: 'goalSimpleEditor.section2.row1.tooltip',
    defaultMessage: 'Attribution Window is in Days and can be between 0 and 30 days.',
  },

  contentSection2Row2Label: {
    id: 'goalSimpleEditor.section2.row2.label',
    defaultMessage: 'Post Click',
  },
  contentSection2Row2Placeholder: {
    id: 'goalSimpleEditor.section2.row2.placeholder',
    defaultMessage: 'Post Click',
  },
  contentSection2Row2Tooltip: {
    id: 'goalSimpleEditor.section2.row2.tooltip',
    defaultMessage: 'Attribution Window is in Days and can be between 0 and 30 days.',
  },

});
