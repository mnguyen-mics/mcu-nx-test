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

  saveCampaigns: {
    id: 'message.submit.campaigns',
    defaultMessage: 'Save',
  },

  /*
  ==============================================================================
  =================================== EDIT CAMPAIGNS ==================================
  ==============================================================================
  */

  editCampaigns: {
    id: 'editCampaigns.breadCrumb',
    defaultMessage: 'Edit Campaigns',
  },
  editAdGroups: {
    id: 'editAdGroups.breadCrumb',
    defaultMessage: 'Edit Ad Groups',
  },
  multiEditTitle: {
    id: 'editCampaigns.title',
    defaultMessage: 'Multi Campaign Edit',
  },
  multiEditSubtitle: {
    id: 'editCampaigns.subtitle',
    defaultMessage: 'In this section you will be able to edit campaigns you just selected : ',
  },
  multiEditAdGroupsTitle: {
    id: 'editAdGroups.title',
    defaultMessage: 'Multi Ad Group Edit',
  },
  warningOnTokenEdition: {
    id: 'campaign.form.edition.technicalName.warning',
    defaultMessage:
      'Danger Zone: Editing this technical name may cause any integrations to fail if not updated properly. Please make sure you have reviewed all your integration before saving.',
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
  breadcrumbTitle3: {
    id: 'adGroupEditor.breadcrumb.title3',
    defaultMessage: 'Edit {name}',
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
    defaultMessage: 'Add Existing',
  },
  dropdownAddOwn: {
    id: 'adGroupEditor.dropdown.addOwn',
    defaultMessage: 'Add Own Segment',
  },
  dropdownAddShared: {
    id: 'adGroupEditor.dropdown.addShared',
    defaultMessage: 'Add Shared Segment',
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
  sectionTitleLocationTargeting: {
    id: 'adGroupEditor.section.title3bis',
    defaultMessage: 'Location Targeting',
  },
  sectionTitleDeviceTargeting: {
    id: 'adGroupEditor.section.title.device',
    defaultMessage: 'Device Targeting',
  },
  sectionTitleDevice: {
    id: 'adGroupEditor.section.title.device',
    defaultMessage: 'Device Targeting',
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
    defaultMessage:
      'Be more specific on which location you want to advertise (country, region or department)',
  },
  sectionSubtitlePublisher: {
    id: 'adGroupEditor.section.subtitle.publisher',
    defaultMessage: 'Select your network to reach you audience',
  },
  sectionSubtitleMedia: {
    id: 'adGroupEditor.section.subtitle.media',
    defaultMessage:
      'Define on which websites you want your content to appear or which section of the website',
  },
  sectionSubtitleAds: {
    id: 'adGroupEditor.section.subtitle.ads',
    defaultMessage: 'This section helps you add new ads to your ad group',
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
    id: 'campaign.section.general.row1.label',
    defaultMessage: 'Campaign Name',
  },
  labelAdGroupName: {
    id: 'adGroupEditor.label.adgroup.name',
    defaultMessage: 'Ad Group Name',
  },
  contentSectionGeneralRow1Placeholder: {
    id: 'adGroupEditor.section.general.row1.placeholder',
    defaultMessage: 'This is an ad group',
  },
  campaignFormPlaceholderCampaignName: {
    id: 'campaign.form.section.general.placeholder.name',
    defaultMessage: 'Your campaign name',
  },
  contentSectionGeneralRow1Tooltip: {
    id: 'adGroupEditor.section.general.row1.tooltip',
    defaultMessage:
      'The campaign name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
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
    defaultMessage: 'The max bid price is the max CPM you will pay during the auction',
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
    defaultMessage:
      "The capping is at the device level, if you don't want any capping at the ad group level set it to 0 and the capping used will be the one defined at the campaign",
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
    defaultMessage:
      "The capping is at the device level, if you don't want any capping at the ad group level set it to 0 and the capping used will be the one defined at the campaign",
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

  // Operating systems

  contentSectionDeviceOSTooltip: {
    id: 'adGroup.section.device.operating_system.tooltip',
    defaultMessage: 'Operating system filter',
  },
  contentSectionDeviceOSLabel: {
    id: 'adGroup.section.device.operating_system.label',
    defaultMessage: 'Operating System',
  },
  contentSectionDeviceOSAll: {
    id: 'adGroup.section.device.operating_system.all',
    defaultMessage: 'All',
  },
  contentSectionDeviceOSiOS: {
    id: 'adGroup.section.device.operating_system.ios',
    defaultMessage: 'iOS',
  },
  contentSectionDeviceOSAndroid: {
    id: 'adGroup.section.device.operating_system.and',
    defaultMessage: 'Android',
  },
  contentSectionDeviceOSWindowsPhone: {
    id: 'adGroup.section.device.operating_system.wip',
    defaultMessage: 'Windows Phone',
  },

  // Device types

  contentSectionDeviceTypeTooltip: {
    id: 'adGroup.section.device.type.tooltip',
    defaultMessage: 'Device type filter',
  },
  contentSectionDeviceTypeLabel: {
    id: 'adGroup.section.device.type.label',
    defaultMessage: 'Device Type',
  },
  contentSectionDeviceTypeAll: {
    id: 'adGroup.section.device.type.all',
    defaultMessage: 'All',
  },
  contentSectionDeviceTypeDesktop: {
    id: 'adGroup.section.device.type.desktop',
    defaultMessage: 'Desktop',
  },
  contentSectionDeviceTypeMobile: {
    id: 'adGroup.section.device.type.mobile',
    defaultMessage: 'Mobile',
  },
  contentSectionDeviceTypeTablet: {
    id: 'adGroup.section.device.type.tablet',
    defaultMessage: 'Tablet',
  },
  contentSectionDeviceTypeMobileAndTablet: {
    id: 'adGroup.section.device.type.mobile_and_tablet',
    defaultMessage: 'Mobile and Tablet',
  },

  // Media types

  contentSectionDeviceMediaTypeTooltip: {
    id: 'adGroup.section.device.media_type.tooltip',
    defaultMessage: 'Media type filter',
  },
  contentSectionDeviceMediaTypeLabel: {
    id: 'adGroup.section.device.media_type.label',
    defaultMessage: 'Media Type',
  },
  contentSectionDeviceMediaTypeWebsite: {
    id: 'adGroup.section.device.media_type.website',
    defaultMessage: 'Website',
  },
  contentSectionDeviceMediaTypeMobileApp: {
    id: 'adGroup.section.device.media_type.mobile_app',
    defaultMessage: 'Mobile App',
  },

  // Connection Types

  contentSectionDeviceConnectionTypeTooltip: {
    id: 'adGroup.section.device.connection_type.tooltip',
    defaultMessage: 'Connection type filter',
  },
  contentSectionDeviceConnectionTypeLabel: {
    id: 'adGroup.section.device.connection_type.label',
    defaultMessage: 'Connection Type',
  },
  contentSectionDeviceConnectionTypeAll: {
    id: 'adGroup.section.device.connection_type.all',
    defaultMessage: 'All',
  },
  contentSectionDeviceConnectionTypeEthernet: {
    id: 'adGroup.section.device.connection_type.ethernet',
    defaultMessage: 'Ethernet',
  },
  contentSectionDeviceConnectionTypeWifi: {
    id: 'adGroup.section.device.connection_type.wifi',
    defaultMessage: 'Wifi',
  },
  contentSectionDeviceConnectionType2G: {
    id: 'adGroup.section.device.connection_type.2g',
    defaultMessage: '2G',
  },
  contentSectionDeviceConnectionType3G: {
    id: 'adGroup.section.device.connection_type.3g',
    defaultMessage: '3G',
  },
  contentSectionDeviceConnectionType4G: {
    id: 'adGroup.section.device.connection_type.4g',
    defaultMessage: '4G',
  },

  // Browser Families

  contentSectionDeviceBrowserTooltip: {
    id: 'adGroup.section.device.browser_family.tooltip',
    defaultMessage: 'Browser filter',
  },
  contentSectionDeviceBrowserLabel: {
    id: 'adGroup.section.device.browser_family.label',
    defaultMessage: 'Browser',
  },
  contentSectionDeviceBrowserAll: {
    id: 'adGroup.section.device.browser_family.all',
    defaultMessage: 'All',
  },
  contentSectionDeviceBrowserChrome: {
    id: 'adGroup.section.device.browser_family.chrome',
    defaultMessage: 'Chrome',
  },
  contentSectionDeviceBrowserFirefox: {
    id: 'adGroup.section.device.browser_family.firefox',
    defaultMessage: 'Firefox',
  },
  contentSectionDeviceBrowserSafari: {
    id: 'adGroup.section.device.browser_family.safari',
    defaultMessage: 'Safari',
  },
  contentSectionDeviceBrowserIE: {
    id: 'adGroup.section.device.browser_family.ie',
    defaultMessage: 'Internet Explorer',
  },
  contentSectionDeviceBrowserOpera: {
    id: 'adGroup.section.device.browser_family.opera',
    defaultMessage: 'Opera',
  },

  contentSectionDeviceModal1: {
    id: 'adGroupEditor.section.device.modal1',
    defaultMessage: "You can't add a device that is inside an already included or excluded device.",
  },
  contentSectionDeviceModal1Title: {
    id: 'adGroupEditor.section.device.modal1Title',
    defaultMessage: 'Warning',
  },
  contentSectionDeviceModal2: {
    id: 'adGroupEditor.section.device.modal2',
    defaultMessage:
      'By adding this device the following device will be removed, do you want to proceed?',
  },
  contentSectionDeviceModal2Title: {
    id: 'adGroupEditor.section.device.modal2Title',
    defaultMessage: 'Warning',
  },

  /* ---------------------------- SECTION LOCATION -------------------------- */

  contentSectionLocationPart2Message: {
    id: 'adGroupEditor.section.location.part2.message',
    defaultMessage: 'I want to target a specific location',
  },

  contentSectionLocationPart2Row1Label: {
    id: 'adGroupEditor.section.location.part2.row1.label',
    defaultMessage: 'Location : ',
  },
  contentSectionLocationInputPlaceholder: {
    id: 'adGroupEditor.section.location.inputPlaceholder',
    defaultMessage: 'Enter a location (country, region or department)',
  },
  contentSectionLocationTooltipMessage: {
    id: 'adGroupEditor.section.location.tooltipMessage',
    defaultMessage:
      'Location is based on the IP address we receive during a bid request. Being too restrictive can alter your reach.',
  },
  contentSectionLocationOption1: {
    id: 'adGroupEditor.section.location.option1',
    defaultMessage: 'Include',
  },
  contentSectionLocationOption2: {
    id: 'adGroupEditor.section.location.option2',
    defaultMessage: 'Exclude',
  },
  contentSectionLocationModal1: {
    id: 'adGroupEditor.section.location.modal1',
    defaultMessage: "You can't add a area that is inside an already included or excluded area.",
  },
  contentSectionLocationModal1Title: {
    id: 'adGroupEditor.section.location.modal1Title',
    defaultMessage: 'Warning',
  },
  contentSectionLocationModal2: {
    id: 'adGroupEditor.section.location.modal2',
    defaultMessage:
      'By adding this location the following location will be removed, do you want to proceed?',
  },
  contentSectionLocationModal2Title: {
    id: 'adGroupEditor.section.location.modal2Title',
    defaultMessage: 'Warning',
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

  /* ------------------------------- SECTION AD ----------------------------- */

  contentSectionAdEmptyTitle: {
    id: 'adGroupEditor.section.ad.emptyTitle',
    defaultMessage: 'Click on the button to add an ad to your ad group',
  },

  updateDisplayCreative: {
    id: 'adGroupEditor.section.ad.updateAd',
    defaultMessage: 'Update',
  },

  editDisplayCreative: {
    id: 'adGroupEditor.section.ad.editDisplayCreative',
    defaultMessage: 'Edit Display Creative',
  },

  addNewCreative: {
    id: 'adGroupEditor.section.ad.addNewCreative',
    defaultMessage: 'Add',
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
  contentSectionSummaryPart1Group7: {
    id: 'adGroupEditor.section.summary.part1.group7',
    defaultMessage: 'budget of',
  },
  contentSectionSummaryPart1Group8: {
    id: 'adGroupEditor.section.summary.part1.group8',
    defaultMessage: '€',
  },

  contentSectionSummaryPart4: {
    id: 'adGroupEditor.section.summary.part4',
    defaultMessage: 'Your ad will target the following devices:',
  },
  contentSectionSummaryPart5: {
    id: 'adGroupEditor.section.summary.part5',
    defaultMessage: 'Your ad will target the following areas:',
  },
  contentSectionIncludedLocations: {
    id: 'adGroupEditor.PartIncludedLocations',
    defaultMessage: 'Your ad will target the following locations:',
  },
  contentSectionExcludedLocations: {
    id: 'adGroupEditor.PartExcludedLocations',
    defaultMessage: 'Your ad will exclude the following locations:',
  },
  contentSectionSummaryPart7: {
    id: 'adGroupEditor.section.summary.part7',
    defaultMessage: 'Your ad will target the following keywords:',
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
    defaultMessage: 'Your Goal Pixel',
  },

  getCodeSnippet: {
    id: 'goal.pixel.get.code.snippet',
    defaultMessage: 'Get code snippet',
  },

  goalPixelModalContent: {
    id: 'goal.pixel.modal.content',
    defaultMessage:
      'Please find your goal pixel below. Give this code to your web administrator or your web developer so that it can be placed on the page that will trigger the goal. For instance, place it on your receipt page to get all the users that have bought something from your store.',
  },
  goalPixelModalSaveGoal: {
    id: 'goal.pixel.modal.saveGoal',
    defaultMessage:
      'Before getting your pixel, we need to save your Goal. After saving you will still be able to modify your goal. Do you want to continue?',
  },
  errorFormMessage: {
    id: 'display.campaigns.edit.generic.errorMessage',
    defaultMessage:
      'There is an error with some fields in your form. Please review the data you entered.',
  },

  /*
  ==============================================================================
  =============================== GOAL PIXEL MODAL =============================
  ==============================================================================
  */

  // saveAdGroup: {
  //   id: 'message.submit.campaign',
  //   defaultMessage: 'Save',
  // },
  // breadcrumbTitle1: {
  //   id: 'campaignEditor.breadcrumb.title',
  //   defaultMessage: 'Display',
  // },
  createCampaingTitle: {
    id: 'campaignEditor.breadcrumb.create.campaign',
    defaultMessage: 'New Campaign',
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
    defaultMessage:
      'Create a Goal that reflects your campaign objectives. You will get a pixel code afterwards to track who has converted to your goal.',
  },
  sectionSubtitle3: {
    id: 'campaignEditor.section.subtitle3',
    defaultMessage:
      'Create one or severals Ad Groups. An Ad Group is basically a Campaign Strategy that has its own Budget, and targeting.',
  },

  /*
  ==============================================================================
  ============================== SECTIONS CONTENT ==============================
  ==============================================================================
  */

  /* Row 1 */
  // contentSectionGeneralRow1Label: {
  //   id: 'campaignEditor.section.general.row1.label',
  //   defaultMessage: 'Campaign Name',
  // },
  // contentSectionGeneralRow1Placeholder: {
  //   id: 'campaignEditor.section.general.row1.placeholder',
  //   defaultMessage: 'Campaign Name',
  // },
  // contentSectionGeneralRow1Tooltip: {
  //   id: 'campaignEditor.section.general.row1.tooltip',
  //   defaultMessage: 'The campaign\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
  // },

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
    defaultMessage: "The capping is at the device level, if you don't want any capping set it to 0",
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
    defaultMessage: "The capping is at the device level, if you don't want any capping set it to 0",
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
  campaignGoalSelectionEmpty: {
    id: 'campaignEditor.section2.emptyTitle',
    defaultMessage: 'Click on the pen to add a Goal to your Campaign',
  },

  /* ------------------------------- SECTION 2 ------------------------------ */

  contentSection3EmptyTitle: {
    id: 'campaignEditor.section3.emptyTitle',
    defaultMessage: 'Click on the pen to add an Ad Group to your Campaign',
  },

  newGoal: {
    id: 'campaignEditor.goal-form.new',
    defaultMessage: 'New Goal',
  },

  editGoal: {
    id: 'campaignEditor.goal-form.edit',
    defaultMessage: 'Edit {goalName}',
  },

  editAdGroup: {
    id: 'campaignEditor.adGroup-form.edit',
    defaultMessage: 'Edit {adGroupName}',
  },
  savingInProgress: {
    id: 'display.campaigns.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },

  /*-------------------------------INVENTORY SECTION -------------------------------------*/

  sectionInventoryTitle: {
    id: 'campaignEditor.sectionInventory.title',
    defaultMessage: 'Inventory Selection',
  },

  sectionInventorySubTitle: {
    id: 'campaignEditor.sectionInventory.subtitle',
    defaultMessage: 'Add Display Networks and Ad Exchanges to your Adgroup.',
  },
});
