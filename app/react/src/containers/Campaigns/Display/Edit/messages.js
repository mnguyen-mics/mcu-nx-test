import { defineMessages } from 'react-intl';

export default defineMessages({

  /*
  ==============================================================================
  =================================== BUTTONS ==================================
  ==============================================================================
  */
  cancel: {
    id: 'message.cancel',
    defaultMessage: 'Cancel',
  },

  ok: {
    id: 'message.ok',
    defaultMessage: 'Ok',
  },

  saveAdGroup: {
    id: 'message.submit.adGroup',
    defaultMessage: 'Save',
  },

  /*
  ==============================================================================
  ============================== BREADCRUMB TITLES =============================
  ==============================================================================
  */
  breadcrumbTitle1: {
    id: 'adGroupEditor.breadcrumb.title1',
    defaultMessage: 'Display',
  },
  breadcrumbTitle2: {
    id: 'adGroupEditor.breadcrumb.title2',
    defaultMessage: 'New Ad Group',
  },

  /*
  ==============================================================================
  ==================================== COMMON ==================================
  ==============================================================================
  */
  toggleOn: {
    id: 'adGroupEditor.section2.toggleOn',
    defaultMessage: 'Target',
  },
  toggleOff: {
    id: 'adGroupEditor.section2.toggleOff',
    defaultMessage: 'Exclude',
  },

  noResults: {
    id: 'adGroupEditor.noResults',
    defaultMessage: '[X]',
  },

  /*
  ==============================================================================
  =============================== DROPDOWN OPTIONS =============================
  ==============================================================================
  */
  dropdownNew: {
    id: 'adGroupEditor.dropdown.new',
    defaultMessage: 'New',
  },
  dropdownAdd: {
    id: 'adGroupEditor.dropdown.add',
    defaultMessage: 'Add',
  },
  dropdownAddExisting: {
    id: 'adGroupEditor.dropdown.addExisting',
    defaultMessage: 'Add existing',
  },

  /*
  ==============================================================================
  ================================ NOTIFICATIONS ===============================
  ==============================================================================
  */
  notificationWarning: {
    id: 'notification.warning',
    defaultMessage: 'Click on this button and you will lose your custom targeting.',
  },

  /*
  ==============================================================================
  ================================ SECTION TITLES ==============================
  ==============================================================================
  */
  sectionTitleGeneral: {
    id: 'adGroupEditor.section.title.general',
    defaultMessage: 'General settings',
  },
  sectionTitleAudience: {
    id: 'adGroupEditor.section.title.audience',
    defaultMessage: 'Audience',
  },
  sectionTitleDevice: {
    id: 'adGroupEditor.section.title.device',
    defaultMessage: 'Device Targeting',
  },
  sectionTitleLocation: {
    id: 'adGroupEditor.section.title.location',
    defaultMessage: 'Location Targeting',
  },
  sectionTitlePublisher: {
    id: 'adGroupEditor.section.title.publisher',
    defaultMessage: 'Publisher',
  },
  sectionTitleMedia: {
    id: 'adGroupEditor.section.title.media',
    defaultMessage: 'Media Content',
  },
  sectionTitleAds: {
    id: 'adGroupEditor.section.title.ads',
    defaultMessage: 'Ads',
  },
  sectionTitlePlacement: {
    id: 'adGroupEditor.section.title.placement',
    defaultMessage: 'Placement',
  },
  sectionTitleOptimizer: {
    id: 'adGroupEditor.section.title.optimizer',
    defaultMessage: 'Optimization',
  },
  sectionTitleSummary: {
    id: 'adGroupEditor.section.title.summary',
    defaultMessage: 'Summary',
  },

  /*
  ==============================================================================
  ============================== SECTION SUBTITLES =============================
  ==============================================================================
  */
  sectionSubtitleGeneral: {
    id: 'adGroupEditor.section.subtitle.general',
    defaultMessage: 'Give your ad group a name and a duration',
  },
  sectionSubtitleAudience: {
    id: 'adGroupEditor.section.subtitle.audience',
    defaultMessage: 'Choose to whom your ad group will be displayed to',
  },
  sectionSubtitleDevice: {
    id: 'adGroupEditor.section.subtitle.device',
    defaultMessage: 'Be more specific on which device you want to advertise',
  },
  sectionSubtitleLocation: {
    id: 'adGroupEditor.section.subtitle.location',
    defaultMessage: 'Be more specific on which location you want to advertise',
  },
  sectionSubtitlePublisher: {
    id: 'adGroupEditor.section.subtitle.publisher',
    defaultMessage: 'Select your network to reach you audience',
  },
  sectionSubtitleMedia: {
    id: 'adGroupEditor.section.subtitle.media',
    defaultMessage: 'Define on which websites you want your content to appear or which section of the website',
  },
  sectionSubtitlePlacement: {
    id: 'adGroupEditor.section.subtitle.placement',
    defaultMessage: 'Define on which websites you want your content to appear',
  },
  sectionSubtitleAds: {
    id: 'adGroupEditor.section.subtitle.ads',
    defaultMessage: 'This section helps you add new ads to your ad group',
  },
  sectionSubtitleOptimizer: {
    id: 'adGroupEditor.section.subtitle.optimizer',
    defaultMessage: 'Leverage the power of AI to optimize the way you bid',
  },
  sectionSubtitleSummary: {
    id: 'adGroupEditor.section.subtitle.summary',
    defaultMessage: 'Please find below the configuration of your ad group',
  },

  /*
  ==============================================================================
  ============================== SECTIONS CONTENT ==============================
  ==============================================================================
  */

  /* ---------------------------- SECTION GENERAL --------------------------- */

  /* Row 1 */
  contentSectionGeneralRow1Label: {
    id: 'adGroupEditor.section.general.row1.label',
    defaultMessage: 'Ad Group Name',
  },
  contentSectionGeneralRow1Placeholder: {
    id: 'adGroupEditor.section.general.row1.placeholder',
    defaultMessage: 'This is an ad group',
  },
  contentSectionGeneralRow1Tooltip: {
    id: 'adGroupEditor.section.general.row1.tooltip',
    defaultMessage: 'The campaign\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  },

  /* Row 2 */
  contentSectionGeneralRow2Label: {
    id: 'adGroupEditor.section.general.row2.label',
    defaultMessage: 'Budget Split',
  },
  contentSectionGeneralRow2Placeholder: {
    id: 'adGroupEditor.section.general.row2.placeholder',
    defaultMessage: '500',
  },
  contentSectionGeneralRow2Tooltip: {
    id: 'adGroupEditor.section.general.row2.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  contentSectionGeneralRow2OptionDAY: {
    id: 'adGroupEditor.section.general.row2.optionDAY',
    defaultMessage: 'Per Day',
  },
  contentSectionGeneralRow2OptionWEEK: {
    id: 'adGroupEditor.section.general.row2.optionWEEK',
    defaultMessage: 'Per Week',
  },
  contentSectionGeneralRow2OptionMONTH: {
    id: 'adGroupEditor.section.general.row2.option1MONTH',
    defaultMessage: 'Per Month',
  },

  /* Row 3 */
  contentSectionGeneralRow3Label: {
    id: 'adGroupEditor.section.general.row3.label',
    defaultMessage: 'Total Budget',
  },
  contentSectionGeneralRow3Placeholder: {
    id: 'adGroupEditor.section.general.row3.placeholder',
    defaultMessage: '1 500',
  },
  contentSectionGeneralRow3Tooltip: {
    id: 'adGroupEditor.section.general.row3.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* Row 4 */
  contentSectionGeneralRow4Label: {
    id: 'adGroupEditor.section.general.row4.label',
    defaultMessage: 'Duration',
  },
  contentSectionGeneralRow4Placeholder1: {
    id: 'adGroupEditor.section.general.row4.placeholder1',
    defaultMessage: 'Start date',
  },
  contentSectionGeneralRow4Placeholder2: {
    id: 'adGroupEditor.section.general.row4.placeholder2',
    defaultMessage: 'End date',
  },
  contentSectionGeneralRow4Tooltip: {
    id: 'adGroupEditor.section.general.row4.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* Row 5 */
  contentSectionGeneralRow5Label: {
    id: 'adGroupEditor.section.general.row5.label',
    defaultMessage: 'Max Bid Price',
  },
  contentSectionGeneralRow5Placeholder: {
    id: 'adGroupEditor.section.general.row5.placeholder',
    defaultMessage: '1.3',
  },
  contentSectionGeneralRow5Tooltip: {
    id: 'adGroupEditor.section.general.row5.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* Row 6 */
  contentSectionGeneralRow6Label: {
    id: 'adGroupEditor.section.general.row6.label',
    defaultMessage: 'Total Impression Capping',
  },
  contentSectionGeneralRow6Placeholder: {
    id: 'adGroupEditor.section.general.row6.placeholder',
    defaultMessage: '10',
  },
  contentSectionGeneralRow6Tooltip: {
    id: 'adGroupEditor.section.general.row6.tooltip',
    defaultMessage: 'The capping is at the device level, if you don\'t want any capping set it to 0',
  },

  /* Row 7 */
  contentSectionGeneralRow7Label: {
    id: 'adGroupEditor.section.general.row7.label',
    defaultMessage: 'Daily Impression Capping',
  },
  contentSectionGeneralRow7Placeholder: {
    id: 'adGroupEditor.section.general.row7.placeholder',
    defaultMessage: '1',
  },
  contentSectionGeneralRow7Tooltip: {
    id: 'adGroupEditor.section.general.row7.tooltip',
    defaultMessage: 'The capping is at the device level, if you don\'t want any capping set it to 0',
  },

  /* Advanced part */

  contentSectionGeneralAdvancedPartTitle: {
    id: 'adGroupEditor.section.general.advancedPart.title',
    defaultMessage: 'Advanced',
  },

  /* Row 8 */
  contentSectionGeneralRow8Label: {
    id: 'adGroupEditor.section.general.row8.label',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralRow8Placeholder: {
    id: 'adGroupEditor.section.general.row8.placeholder',
    defaultMessage: 'This is an ad group',
  },
  contentSectionGeneralRow8Tooltip: {
    id: 'adGroupEditor.section.general.row8.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* ---------------------------- SECTION AUDIENCE -------------------------- */

  contentSectionAudienceMedium1: {
    id: 'adGroupEditor.section.audience.medium1',
    defaultMessage: 'User Points',
  },
  contentSectionAudienceMedium2: {
    id: 'adGroupEditor.section.audience.medium2',
    defaultMessage: 'Desktop',
  },

  contentSectionAudienceEmptyTitle: {
    id: 'adGroupEditor.section.audience.emptyTitle',
    defaultMessage: 'Click on the pen to add an audience to your ad group',
  },

  /* ----------------------------- SECTION DEVICE --------------------------- */

  contentSectionDevicePart1Message: {
    id: 'adGroupEditor.section.device.part1.message',
    defaultMessage: 'I want to target a specific device/os/carrier',
  },

  contentSectionDevicePart1Row1Label: {
    id: 'adGroupEditor.section.device.part1.row1.label',
    defaultMessage: 'Device Type',
  },
  contentSectionDevicePart1Row1Placeholder: {
    id: 'adGroupEditor.section.device.part1.row1.placeholder',
    defaultMessage: 'Please select',
  },
  contentSectionDevicePart1Row1Tooltip: {
    id: 'adGroupEditor.section.device.part1.row1.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  contentSectionDevicePart1Row2Label: {
    id: 'adGroupEditor.section.device.part1.row2.label',
    defaultMessage: 'OS',
  },
  contentSectionDevicePart1Row2Placeholder: {
    id: 'adGroupEditor.section.device.part1.row2.placeholder',
    defaultMessage: 'Please select',
  },
  contentSectionDevicePart1Row2Tooltip: {
    id: 'adGroupEditor.section.device.part1.row2.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  contentSectionDevicePart1Row3Label: {
    id: 'adGroupEditor.section.device.part1.row3.label',
    defaultMessage: 'Browser',
  },
  contentSectionDevicePart1Row3Tooltip: {
    id: 'adGroupEditor.section.device.part1.row3.tooltip',
    defaultMessage: 'Lorem ipsum',
  },
  contentSectionDevicePart1Row3Placeholder: {
    id: 'adGroupEditor.section.device.part1.row3.placeholder',
    defaultMessage: 'http://www...',
  },

  contentSectionDevicePart1Row4Label: {
    id: 'adGroupEditor.section.device.part1.row4.label',
    defaultMessage: 'Carrier',
  },
  contentSectionDevicePart1Row4Tooltip: {
    id: 'adGroupEditor.section.device.part1.row4.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* ---------------------------- SECTION LOCATION -------------------------- */

  contentSectionLocationPart2Message: {
    id: 'adGroupEditor.section.location.part2.message',
    defaultMessage: 'I want to target a specific location',
  },

  contentSectionLocationPart2Row1Label: {
    id: 'adGroupEditor.section.location.part2.row1.label',
    defaultMessage: 'Location',
  },
  contentSectionLocationPart2Row1Tooltip: {
    id: 'adGroupEditor.section.location.part2.row1.tooltip',
    defaultMessage: 'Lorem ipsum',
  },

  /* ----------------------------- SECTION MEDIA ---------------------------- */

  contentSectionMediaEmptyTitle: {
    id: 'adGroupEditor.section.media.emptyTitle',
    defaultMessage: 'Click on the pen to add a media to your ad group',
  },

  /* --------------------------- SECTION PUBLISHER -------------------------- */

  contentSectionPublisherEmptyTitle: {
    id: 'adGroupEditor.section.publisher.emptyTitle',
    defaultMessage: 'Click on the pen to add a publisher to your ad group',
  },

  /* --------------------------- SECTION PLACEMENT -------------------------- */

  contentSectionPlacementRadio1: {
    id: 'adGroupEditor.section.placement.radio1',
    defaultMessage: 'Automatic Placements (Recommended)',
  },
  contentSectionPlacementRadio2: {
    id: 'adGroupEditor.section.placement.radio2',
    defaultMessage: 'Edit Placements',
  },

  contentSectionPlacementTooltip: {
    id: 'adGroupEditor.section.placement.tooltip',
    defaultMessage: 'Lorem Ips',
  },
  contentSectionPlacementProperties: {
    id: 'adGroupEditor.section.placement.properties',
    defaultMessage: 'Properties',
  },
  contentSectionPlacementTypeWebsites: {
    id: 'adGroupEditor.section.placement.type.websites',
    defaultMessage: 'Web Sites',
  },
  contentSectionPlacementTypeMobileApps: {
    id: 'adGroupEditor.section.placement.type.mobileApps',
    defaultMessage: 'Mobile Apps',
  },

  contentSectionPlacementSearchPlaceholder: {
    id: 'adGroupEditor.section.placement.search.placeholder',
    defaultMessage: 'Search',
  },
  contentSectionPlacementSearchEmptyTable: {
    id: 'adGroupEditor.section.placement.search.emptyTable',
    defaultMessage: 'No result',
  },

  contentSectionPlacementEmptyTitle: {
    id: 'adGroupEditor.section.placement.emptyTitle',
    defaultMessage: 'Click on the pen to add a placement to your ad group',
  },

  /* ------------------------------- SECTION AD ----------------------------- */

  contentSectionAdEmptyTitle: {
    id: 'adGroupEditor.section.ad.emptyTitle',
    defaultMessage: 'Click on the pen to add an ad to your ad group',
  },

  /* --------------------------- SECTION OPTIMIZER -------------------------- */

  contentSectionOptimizerEmptyTitle: {
    id: 'adGroupEditor.section.optimizer.emptyTitle',
    defaultMessage: 'Click on the pen to add an optimizer to your ad group',
  },

  /* ---------------------------- SECTION SUMMARY --------------------------- */

  // TODO: use formatMessage(messages.greeting, {name: 'Eric'});
  // cf. https://github.com/yahoo/react-intl/wiki/API
  contentSectionSummaryPart1Group1: {
    id: 'adGroupEditor.section.summary.part1.group1',
    defaultMessage: 'Your ad group will run from',
  },
  contentSectionSummaryPart1Group2: {
    id: 'adGroupEditor.section.summary.part1.group2',
    defaultMessage: 'the',
  },
  contentSectionSummaryPart1Group3: {
    id: 'adGroupEditor.section.summary.part1.group3',
    defaultMessage: 'today',
  },
  contentSectionSummaryPart1Group4: {
    id: 'adGroupEditor.section.summary.part1.group4',
    defaultMessage: 'to the',
  },
  contentSectionSummaryPart1Group5: {
    id: 'adGroupEditor.section.summary.part1.group5',
    defaultMessage: 'with a',
  },
  contentSectionSummaryPart1Group6OptionDAY: {
    id: 'adGroupEditor.section.summary.part1.group6.optionDAY',
    defaultMessage: 'DAILY',
  },
  contentSectionSummaryPart1Group6OptionWEEK: {
    id: 'adGroupEditor.section.summary.part1.group6.optionWEEK',
    defaultMessage: 'WEEKLY',
  },
  contentSectionSummaryPart1Group6OptionMONTH: {
    id: 'adGroupEditor.section.summary.part1.group6.optionMONTH',
    defaultMessage: 'MONTHLY',
  },
  contentSectionSummaryPart1Group7: {
    id: 'adGroupEditor.section.summary.part1.group7',
    defaultMessage: 'budget of',
  },
  contentSectionSummaryPart1Group8: {
    id: 'adGroupEditor.section.summary.part1.group8',
    defaultMessage: '€',
  },

  contentSectionSummaryPart2: {
    id: 'adGroupEditor.section.summary.part2',
    defaultMessage: 'Your ad will be visible for the following segments:',
  },
  contentSectionSummaryPart3: {
    id: 'adGroupEditor.section.summary.part3',
    defaultMessage: 'Your ad will not be published for people inside the following segment:',
  },
  contentSectionSummaryPart4: {
    id: 'adGroupEditor.section.summary.part4',
    defaultMessage: 'Your ad will target the following devices:',
  },
  contentSectionSummaryPart5: {
    id: 'adGroupEditor.section.summary.part5',
    defaultMessage: 'Your ad will target the following areas:',
  },
  contentSectionSummaryPart6: {
    id: 'adGroupEditor.section.summary.part6',
    defaultMessage: 'Your ad will be published on the following networks:',
  },
  contentSectionSummaryPart7: {
    id: 'adGroupEditor.section.summary.part7',
    defaultMessage: 'Your ad will target the following keywords:',
  },
  contentSectionSummaryPart8: {
    id: 'adGroupEditor.section.summary.part8',
    defaultMessage: 'Your ad is using the following bid optimizer:',
  },
  contentSectionSummaryPart9Group1: {
    id: 'adGroupEditor.section.summary.part9.group1',
    defaultMessage: 'You have',
  },
  contentSectionSummaryPart9Negation: {
    id: 'adGroupEditor.section.summary.part9.negation',
    defaultMessage: 'no',
  },
  contentSectionSummaryPart9Group2: {
    id: 'adGroupEditor.section.summary.part9.group2',
    defaultMessage: 'attached to your ad',
  },
  contentSectionSummaryPart9Singular: {
    id: 'adGroupEditor.section.summary.part9.Singular',
    defaultMessage: 'creative',
  },
  contentSectionSummaryPart9Plural: {
    id: 'adGroupEditor.section.summary.part9.Plural',
    defaultMessage: 'creatives',
  },

  /*
  ==============================================================================
  ================================ SECTION SELECTORS ==============================
  ==============================================================================
  */

  sectionSelectorTitleName: {
    id: 'section.selector.title.name',
    defaultMessage: 'Name',
  },
  sectionSelectorTitleProvider: {
    id: 'section.selector.title.provider',
    defaultMessage: 'Provider',
  },
  sectionSelectorTitleUserPoints: {
    id: 'section.selector.title.userPoints',
    defaultMessage: 'User Points',
  },
  sectionSelectorTitleCookieIds: {
    id: 'section.selector.title.cookieIds',
    defaultMessage: 'Desktop Cookie Ids',
  },

  /*
  ==============================================================================
  =============================== GOAL PIXEL MODAL =============================
  ==============================================================================
  */

  goalPixelModalTitle: {
    id: 'goal.pixel.modal.title',
    defaultMessage: 'Your Goal Pixel'
  },

  goalPixelModalContent: {
    id: 'goal.pixel.modal.content',
    defaultMessage: 'Please find your goal pixel below. Give this code to your web administrator or your web developer so that it can be placed on the page that will trigger the goal. For instance, place it on your receipt page to get all the users that have bought something from your store.'
  },
  goalPixelModalSaveGoal: {
    id: 'goal.pixel.modal.saveGoal',
    defaultMessage: 'Before Getting your pixel, we need to save your Goal. After saving you won\'t be able to modify your goal. Are you sure you want to save your Goal?'
  },
  errorFormMessage: {
    id: 'campaign.form.generic.error.message',
    defaultMessage: 'There is an error with some fields in your form. Please review the data you entered.',
  }
});
