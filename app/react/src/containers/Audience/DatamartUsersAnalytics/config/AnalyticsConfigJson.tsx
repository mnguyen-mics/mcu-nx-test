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
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 0,
      y: 6,
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          height: 300,
          colors: ['#2fa1de'],
          credits: {
            enabled: false,
          },
          chart: {
            reflow: true,
          },
          xAxis: {
            ...generateXAxisGridLine(),
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%d %b %Y', // ex- 01 Jan 2016
            },
            title: {
              text: null,
            },
          },
          time: { timezoneOffset: -60, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: false,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },

        xKey: 'date_yyyy_mm_dd',
        metricName: 'sessions',
      },
    ],
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
          title: 'Average session duration (Last 7 days)',
        },
        metricName: 'avg_session_duration'
      }
    ]
  },
];


export const channelEngagementConfig = [
  {
    title: 'Session in time (Last 7 days)',
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
          colors: ['#2fa1de'],
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
            enabled: false
          },
          tooltip: {
            shared: true,
            ...generateTooltip()
          }
        },
        xKey: 'date_yyyy_mm_dd',
        metricName: 'sessions'
      }
    ]
  },
  {
    title: 'Sessions by Form Factor (Last 7 days)',
    layout: {
      'i': '2',
      'h': 3,
      'static': false,
      'w': 4,
      'x': 0,
      'y': 0,

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
        xKey: 'device_form_factor',
        metricName: 'sessions',
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
    title: 'Sessions by Browser Family (Last 7 days)',
    layout: {
      'i': '2',
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
        xKey:  'device_browser_family',
        metricName: 'sessions',
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
    title: 'Sessions by OS (Last 7 days)',
    layout: {
      'i': '2',
      'h': 3,
      'static': true,
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
        xKey:  'device_os_family',
        metricName: 'sessions',
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



