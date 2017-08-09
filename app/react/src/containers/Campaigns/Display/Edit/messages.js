import { defineMessages } from 'react-intl';

export default defineMessages({

  /* Buttons */
  saveAdGroup: {
    id: 'message.submit.adGroup',
    defaultMessage: 'Save',
  },

  /* Breadcrumb titles */
  breadcrumbTitle1: {
    id: 'adGroupEditor.breadcrumb.title1',
    defaultMessage: 'Display',
  },
  breadcrumbTitle2: {
    id: 'adGroupEditor.breadcrumb.title2',
    defaultMessage: 'XXXXXXXXXXXXX',
  },
  breadcrumbTitle3: {
    id: 'adGroupEditor.breadcrumb.title3',
    defaultMessage: 'New Ad Group',
  },

  /* Common */
  toggleOn: {
    id: 'adGroupEditor.section2.toggleOn',
    defaultMessage: 'Target',
  },
  toggleOff: {
    id: 'adGroupEditor.section2.toggleOff',
    defaultMessage: 'Exclude',
  },

  /* Sections content */
  contentSection1: {
    row1: {
      label: {
        id: 'adGroupEditor.section1.row1.label',
        defaultMessage: 'Ad Group Name *',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row1.placeholder',
        defaultMessage: 'This is an ad group',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row1.tooltip',
        defaultMessage: 'The campaign\'s name will help you identify it on the different screens. Make it as memorable as you want your results to be!',
      },
    },

    row2: {
      label: {
        id: 'adGroupEditor.section1.row2.label',
        defaultMessage: 'Budget Split *',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row2.placeholder',
        defaultMessage: '500 €',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row2.tooltip',
        defaultMessage: 'Lorem ipsum',
      },
    },

    row3: {
      label: {
        id: 'adGroupEditor.section1.row3.label',
        defaultMessage: 'Total Budget *',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row3.placeholder',
        defaultMessage: '1 500 €',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row3.tooltip',
        defaultMessage: 'Lorem ipsum',
      },
    },

    row4: {
      label: {
        id: 'adGroupEditor.section1.row4.label',
        defaultMessage: 'Duration *',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row4.placeholder',
        defaultMessage: 'Today',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row4.tooltip',
        defaultMessage: 'Lorem ipsum',
      },
    },

    row5: {
      label: {
        id: 'adGroupEditor.section1.row5.label',
        defaultMessage: 'Technical Name',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row5.placeholder',
        defaultMessage: 'This is an ad group',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row5.tooltip',
        defaultMessage: 'Lorem ipsum',
      },
    },

    row6: {
      label: {
        id: 'adGroupEditor.section1.row6.label',
        defaultMessage: 'KPI',
      },
      placeholder: {
        id: 'adGroupEditor.section1.row6.placeholder',
        defaultMessage: 'This is an ad group',
      },
      tooltip: {
        id: 'adGroupEditor.section1.row6.tooltip',
        defaultMessage: 'Lorem ipsum',
      },
    }
  },

  contentSection3: {
    part1: {
      message: {
        id: 'adGroupEditor.section3.part1.message',
        defaultMessage: 'I want to target a specific device/os/carrier',
      },

      row1: {
        label: {
          id: 'adGroupEditor.section3.part1.row1.label',
          defaultMessage: 'Device',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part1.row1.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },

      row2: {
        label: {
          id: 'adGroupEditor.section3.part1.row2.label',
          defaultMessage: 'Browser',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part1.row2.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },

      row3: {
        label: {
          id: 'adGroupEditor.section3.part1.row3.label',
          defaultMessage: 'OS',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part1.row3.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },

      row4: {
        label: {
          id: 'adGroupEditor.section3.part1.row4.label',
          defaultMessage: 'Carrier',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part1.row4.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },
    },
    part2: {
      message: {
        id: 'adGroupEditor.section3.part2.message',
        defaultMessage: 'I want to target a specific Region, City, Country for my ad',
      },

      row1: {
        label: {
          id: 'adGroupEditor.section3.part2.row1.label',
          defaultMessage: 'Country',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part2.row1.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },

      row2: {
        label: {
          id: 'adGroupEditor.section3.part2.row2.label',
          defaultMessage: 'Region',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part2.row2.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },

      row3: {
        label: {
          id: 'adGroupEditor.section3.part2.row3.label',
          defaultMessage: 'City',
        },
        tooltip: {
          id: 'adGroupEditor.section3.part2.row3.tooltip',
          defaultMessage: 'Lorem ipsum',
        },
      },
    }
  },

  contentSection5: {
    message: {
      id: 'adGroupEditor.section5.message',
      defaultMessage: 'Click on the pen to add a placement to your ad group',
    },
  },

  // TODO: use formatMessage(messages.greeting, {name: 'Eric'});
  // cf. https://github.com/yahoo/react-intl/wiki/API
  contentSection8: {
    part1: {
      id: 'adGroupEditor.section8.part1',
      defaultMessage: 'Your ad group will run from {start} to the {finish} with a {rate} budget of {budget} €',
    },
    part2: {
      id: 'adGroupEditor.section8.part2',
      defaultMessage: 'Your ad will be visible for the following segments\n{segments}'
    },
    part3: {
      id: 'adGroupEditor.section8.part3',
      defaultMessage: 'Your ad will not be published for people inside the following segment\n{segment}'
    },
    part4: {
      id: 'adGroupEditor.section8.part4',
      defaultMessage: 'Your ad will target the following devices\n{devices}'
    },
    part5: {
      id: 'adGroupEditor.section8.part5',
      defaultMessage: 'Your ad will target the following areas\n{areas}'
    },
    part6: {
      id: 'adGroupEditor.section8.part6',
      defaultMessage: 'Your ad will be published on the following networks\n{networks}'
    },
    part7: {
      id: 'adGroupEditor.section8.part7',
      defaultMessage: 'Your ad will target the following keywords\n{keywords}'
    },
    part8: {
      id: 'adGroupEditor.section8.part8',
      defaultMessage: 'Your ad is using the following bid optimizer\n{optimizer}'
    },
    part9: {
      id: 'adGroupEditor.section8.part9',
      defaultMessage: 'You have {number} creatives attached to your ad'
    },
  },

  /* Dropdown options */
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

  /* Section titles */
  sectionTitle1: {
    id: 'adGroupEditor.section.title1',
    defaultMessage: 'General Information',
  },
  sectionTitle2: {
    id: 'adGroupEditor.section.title2',
    defaultMessage: 'Audience',
  },
  sectionTitle3: {
    id: 'adGroupEditor.section.title3',
    defaultMessage: 'Device & Location',
  },
  sectionTitle4: {
    id: 'adGroupEditor.section.title5',
    defaultMessage: 'Publisher',
  },
  sectionTitle5: {
    id: 'adGroupEditor.section.title6',
    defaultMessage: 'Media Content',
  },
  sectionTitle6: {
    id: 'adGroupEditor.section.title7',
    defaultMessage: 'Optimization',
  },
  sectionTitle7: {
    id: 'adGroupEditor.section.title8',
    defaultMessage: 'Ads',
  },
  sectionTitle8: {
    id: 'adGroupEditor.section.title9',
    defaultMessage: 'Summary',
  },

  sectionSubtitle1: {
    id: 'adGroupEditor.section.subtitle1',
    defaultMessage: 'Give your ad group a name and a duration',
  },
  sectionSubtitle2: {
    id: 'adGroupEditor.section.subtitle2',
    defaultMessage: 'Choose to whom your ad group will be displayed to',
  },
  sectionSubtitle3: {
    id: 'adGroupEditor.section.subtitle3',
    defaultMessage: 'Be more specific on which device you want to advertise',
  },
  sectionSubtitle4: {
    id: 'adGroupEditor.section.subtitle5',
    defaultMessage: 'Select your network to reach you audience',
  },
  sectionSubtitle5: {
    id: 'adGroupEditor.section.subtitle6',
    defaultMessage: 'Define on which websites you want your content to appear or which section of the website',
  },
  sectionSubtitle6: {
    id: 'adGroupEditor.section.subtitle7',
    defaultMessage: 'Leverage the power of AI to optimize the way you bid',
  },
  sectionSubtitle7: {
    id: 'adGroupEditor.section.subtitle8',
    defaultMessage: 'This section helps you add new ads to your ad group',
  },
  sectionSubtitle8: {
    id: 'adGroupEditor.section.subtitle9',
    defaultMessage: 'Before submitting, please review the configuration of your ad group',
  },
});
