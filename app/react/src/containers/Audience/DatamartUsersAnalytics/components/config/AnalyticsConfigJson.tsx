import {
  generateXAxisGridLine,
  generateYAxisGridLine,
  generateTooltip,
} from '../../../../../components/Charts/domain';

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
