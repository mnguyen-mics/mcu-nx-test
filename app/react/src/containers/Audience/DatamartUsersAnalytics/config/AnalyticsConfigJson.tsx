import {
  generateXAxisGridLine,
  generateYAxisGridLine,
  generateTooltip,
} from '../../../../components/Charts/domain';
import chroma from 'chroma-js';

export const sessionInTimeJsonConfig = [
  {
    title: 'Session in time',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 0,
      'y': 0
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y'    // ex- 01 Jan 2016
            },
            title: {
              text: null
            }
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
];

export const averageSessionDurationConfig = [
  {
    layout: {
      'i': '0',
      'h': 1,
      'static': false,
      'w': 3,
      'x': 0,
      'y': 0
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: 'Average session duration'
        },
        unit: 'time',
        metricNames: ['avg_session_duration'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    layout: {
      'i': '0',
      'h': 1,
      'static': false,
      'w': 3,
      'x': 3,
      'y': 0
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: 'Average Events per Session',
        },
        metricNames: ['avg_number_of_user_events'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    layout: {
      'i': '0',
      'h': 1,
      'static': false,
      'w': 3,
      'x': 6,
      'y': 0
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: 'Average Conversion Rate',
        },
        unit: '%',
        metricNames: ['conversion_rate'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
];


export const channelEngagementConfig = [
  {
    title: 'Session in time',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 0,
      'y': 0
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y'    // ex- 01 Jan 2016
            },
            title: {
              text: null
            }
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by Channel',
    layout: {
      'i': '2',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 6,
      'y': 0
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'column'
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['channel_name', 'channel_id'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by Form Factor',
    layout: {
      'i': '3',
      'h': 3,
      'static': false,
      'w': 4,
      'x': 0,
      'y': 3,

    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: '',
          innerRadius: true,
          isHalf: false,
          colors: chroma.scale(['#003056', '#00a1df']).mode('lch').colors(7),
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              }
            },
          },
          text: {
            text: '',
            value: '',
          },
          showTooltip: true,
          tooltip: {
            shared: true,
            ...generateTooltip()
          },
          height: 300,
          showLabels: true,
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_form_factor'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by Browser Family',
    layout: {
      'i': '4',
      'h': 3,
      'static': false,
      'w': 4,
      'x': 4,
      'y': 3
    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: '',
          innerRadius: true,
          isHalf: false,
          colors: chroma.scale(['#003056', '#00a1df']).mode('lch').colors(7),
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              }
            },
          },
          text: {
            text: '',
            value: '',
          },
          showTooltip: true,
          tooltip: {
            shared: true,
            ...generateTooltip()
          },
          height: 300,
          showLabels: true,
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_browser_family'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by OS',
    layout: {
      'i': '5',
      'h': 3,
      'static': false,
      'w': 4,
      'x': 8,
      'y': 3
    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: '',
          innerRadius: true,
          isHalf: false,
          colors: chroma.scale(['#003056', '#00a1df']).mode('lch').colors(7),
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              }
            },
          },
          text: {
            text: '',
            value: '',
          },
          showTooltip: true,
          tooltip: {
            shared: true,
            ...generateTooltip()
          },
          height: 300,
          showLabels: true,
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_os_family'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Active Users By Channel',
    layout: {
      'i': '6',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 0,
      'y': 6
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y'    // ex- 01 Jan 2016
            },
            title: {
              text: null
            }
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        metricNames: ['users'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  }
];

export const acquisitionEngagementConfig = [
  {
    title: 'Sessions by Source in Time',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 0,
      'y': 0
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y'    // ex- 01 Jan 2016
            },
            title: {
              text: null
            }
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['origin_source', 'date_yyyy_mm_dd'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by Source',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 6,
      'y': 0
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'column'
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['origin_source'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions By Origin in Time',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 0,
      'y': 3
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y'    // ex- 01 Jan 2016
            },
            title: {
              text: null
            }
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['origin_channel', 'date_yyyy_mm_dd'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Sessions by Origin',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 6,
      'x': 6,
      'y': 3
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'column'
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        dimensions: ['origin_channel'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
  {
    title: 'Average Session duration by origin source',
    layout: {
      'i': '1',
      'h': 3,
      'static': false,
      'w': 12,
      'x': 0,
      'y': 6
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          height: 300,
          colors: chroma.scale(['#00a1df','#003056']).mode('lch').colors(5),
          credits: {
            enabled: false
          },
          chart: {
            reflow: true
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'column'
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null
            }
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6
          },
          tooltip: {
            shared: true,
            ...generateTooltip(true, true)
          }
        },
        dimensions: ['origin_source'],
        metricNames: ['avg_session_duration'],
        dimensionFilterClauses: {
          'operator': 'OR',
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST',
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        },
      }
    ]
  },
];

