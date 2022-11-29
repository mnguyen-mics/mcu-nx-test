import { defineMessages } from 'react-intl';

export default defineMessages({
  saveGoal: {
    id: 'message.submit.goalSimple',
    defaultMessage: 'Save',
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
  goalFormSiderMenuTriggerType: {
    id: 'goal.form.sider.menu.trigger.type',
    defaultMessage: 'Trigger Type',
  },
  sectionTitle1: {
    id: 'goalSimpleEditor.section.title1',
    defaultMessage: 'General Information',
  },
  sectionTitle2: {
    id: 'goalSimpleEditor.section.title2',
    defaultMessage: 'Conversion Value',
  },
  sectionTitle3: {
    id: 'goalSimpleEditor.section.title3',
    defaultMessage: 'Trigger',
  },
  sectionTitle4: {
    id: 'goalSimpleEditor.section.title4',
    defaultMessage: 'Attribution Models',
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
  contentSectionGeneralRow1Label: {
    id: 'goalSimpleEditor.section.general.row1.label',
    defaultMessage: 'Goal Name',
  },
  contentSectionGeneralRow1Placeholder: {
    id: 'goalSimpleEditor.section.general.row1.placeholder',
    defaultMessage: 'Goal Name',
  },
  contentSectionGeneralRow1Tooltip: {
    id: 'goalSimpleEditor.section.general.row1.tooltip',
    defaultMessage:
      "The Goal's name will help you identify it on the different screens. Make it as memorable as you want your results to be!",
  },

  /* Advanced part */

  contentSectionGeneralAdvancedPartTitle: {
    id: 'goalSimpleEditor.section.general.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  /* Row 2 */
  contentSectionGeneralAdvancedPartRow1Label: {
    id: 'goalSimpleEditor.section.general.advanced.row1.label',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Placeholder: {
    id: 'goalSimpleEditor.section.general.advanced.row1.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartRow1Tooltip: {
    id: 'goalSimpleEditor.section.general.advanced.row1.tooltip',
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
