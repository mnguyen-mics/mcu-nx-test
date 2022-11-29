import {
  generateXAxisGridLine,
  generateYAxisGridLine,
  generateTooltip,
} from '../../../../components/Charts/domain';
import chroma from 'chroma-js';
import { DashboardConfig } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';

const timezoneOffset = new Date().getTimezoneOffset();

export const sessionInTimeJsonConfig: DashboardConfig[] = [
  {
    title: 'Session in time',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        sampling: 1,
        filterBy: 'channel_name',
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];

export const averageSessionDurationConfig: DashboardConfig[] = [
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Session Duration' },
        },
        unit: 'time',
        metricNames: ['avg_session_duration'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 4,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Events per Session' },
        },
        metricNames: ['avg_number_of_user_events'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 8,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Conversion Rate' },
        },
        unit: '%',
        metricNames: ['conversion_rate'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];

export const abTestingDashboardConfig: DashboardConfig[] = [
  {
    title: 'Average Revenue Per User Point',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['avg_revenue_per_user_point'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Transaction Amount',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['avg_transaction_amount'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Number Of Transactions',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['avg_number_of_transactions_per_user_point'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Session Duration',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['avg_session_duration'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Events per Session',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['avg_number_of_user_events'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Conversion Rate',
    tabMode: true,
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        enhancedManualReportView: true,
        options: {
          title: undefined,
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['date_yyyy_mm_dd'],
        sampling: 1,
        metricNames: ['conversion_rate'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];

export const ecommerceEngagementConfig: DashboardConfig[] = [
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Number Of Transactions' },
        },
        unit: 'number',
        metricNames: ['avg_number_of_transactions_per_user_point'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 4,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Transaction Amount' },
        },
        metricNames: ['avg_transaction_amount'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    layout: {
      i: '0',
      h: 1,
      static: false,
      w: 4,
      x: 8,
      y: 0,
    },
    charts: [
      {
        type: 'SINGLE_STAT',
        options: {
          title: { text: 'Average Revenue Per User Point' },
        },
        unit: '€',
        metricNames: ['avg_revenue_per_user_point'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];

export const channelEngagementConfig: DashboardConfig[] = [
  {
    title: 'Session in time',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        sampling: 1,
        filterBy: 'channel_name',
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by Channel',
    layout: {
      i: '2',
      h: 3,
      static: false,
      w: 6,
      x: 6,
      y: 0,
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
          credits: {
            enabled: false,
          },
          chart: {
            reflow: true,
          },
          xAxis: {
            ...generateXAxisGridLine(),
          },
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['channel_name', 'channel_id'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by Form Factor',
    layout: {
      i: '3',
      h: 3,
      static: false,
      w: 4,
      x: 0,
      y: 3,
    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: undefined,
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              },
            },
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_form_factor'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by Browser Family',
    layout: {
      i: '4',
      h: 3,
      static: false,
      w: 4,
      x: 4,
      y: 3,
    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: undefined,
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              },
            },
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_browser_family'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by OS',
    layout: {
      i: '5',
      h: 3,
      static: false,
      w: 4,
      x: 8,
      y: 3,
    },
    charts: [
      {
        type: 'PIE',
        options: {
          title: undefined,
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: 'rgba(0, 0, 0, 0.65)',
                },
              },
            },
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
          credits: {
            enabled: false,
          },
        },
        dimensions: ['device_os_family'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Active Users By Channel',
    layout: {
      i: '6',
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
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['channel_name', 'channel_id', 'date_yyyy_mm_dd'],
        sampling: 1,
        filterBy: 'channel_name',
        metricNames: ['users'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];

export const acquisitionEngagementConfig: DashboardConfig[] = [
  {
    title: 'Sessions by Source in Time',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 0,
      y: 0,
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['origin_source', 'date_yyyy_mm_dd'],
        sampling: 1,
        filterBy: 'origin_source',
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by Source',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 6,
      y: 0,
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
          credits: {
            enabled: false,
          },
          chart: {
            reflow: true,
          },
          xAxis: {
            ...generateXAxisGridLine(),
          },
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['origin_source'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions By Origin in Time',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 0,
      y: 3,
    },
    charts: [
      {
        type: 'AREA',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
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
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['origin_channel', 'date_yyyy_mm_dd'],
        sampling: 1,
        filterBy: 'origin_channel',
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Sessions by Origin',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 6,
      x: 6,
      y: 3,
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
          credits: {
            enabled: false,
          },
          chart: {
            reflow: true,
          },
          xAxis: {
            ...generateXAxisGridLine(),
          },
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(),
          },
        },
        dimensions: ['origin_channel'],
        metricNames: ['sessions'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Average Session duration by origin source',
    layout: {
      i: '1',
      h: 3,
      static: false,
      w: 12,
      x: 0,
      y: 6,
    },
    charts: [
      {
        type: 'COLUMN',
        options: {
          title: undefined,
          colors: chroma.scale(['#00a1df', '#003056']).mode('lch').colors(5),
          credits: {
            enabled: false,
          },
          chart: {
            reflow: true,
          },
          xAxis: {
            ...generateXAxisGridLine(),
          },
          time: { timezoneOffset, useUTC: true },
          yAxis: {
            ...generateYAxisGridLine(),
            title: {
              text: null,
            },
          },
          legend: {
            enabled: true,
            verticalAlign: 'top',
            itemMarginBottom: 6,
          },
          tooltip: {
            shared: true,
            ...generateTooltip(true, true),
          },
        },
        dimensions: ['origin_source'],
        metricNames: ['avg_session_duration'],
        dimensionFilterClauses: {
          operator: 'OR',
          filters: [
            {
              dimension_name: 'type',
              not: false,
              operator: 'IN_LIST',
              expressions: ['SITE_VISIT', 'APP_VISIT'],
              case_sensitive: false,
            },
          ],
        },
      },
    ],
  },
];
