import { DashboardContentSections } from '../../../../models/dashboards/dashboards';

export const defaultDashboardContent: DashboardContentSections = {
  sections: [
    {
      title: 'General Information',
      cards: [
        {
          x: 0,
          y: 0,
          w: 12,
          h: 3,
          layout: 'vertical',
          charts: [
            {
              title: 'Device form factors',
              type: 'bars',
              dataset: {
                type: 'otql',
                query_id: '50171',
              },
              options: {
                xKey: 'key',
                format: 'count',
                yKeys: [
                  {
                    key: 'value',
                    message: 'count',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Demographics',
      cards: [
        {
          x: 0,
          y: 0,
          w: 12,
          h: 3,
          charts: [
            {
              title: 'Gender',
              type: 'pie',
              dataset: {
                type: 'otql',
                query_id: '50168',
              },
              options: {
                legend: {
                  enabled: true,
                  position: 'right',
                },
                xKey: 'key',
                format: 'count',
                yKeys: [
                  {
                    key: 'value',
                    message: 'count',
                  },
                ],
              },
            },
          ],
        },
        {
          x: 0,
          y: 0,
          w: 6,
          h: 3,
          charts: [
            {
              title: 'Age range',
              type: 'pie',
              dataset: {
                type: 'otql',
                query_id: '50172',
              },
            },
          ],
        },
        {
          x: 6,
          y: 0,
          w: 6,
          h: 3,
          charts: [
            {
              title: 'Social class',
              type: 'bars',
              dataset: {
                type: 'otql',
                query_id: '50169',
              },
              options: {
                type: 'bar',
                xKey: 'key',
                format: 'count',
                yKeys: [
                  {
                    key: 'value',
                    message: 'count',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Behavioral',
      cards: [
        {
          x: 0,
          y: 0,
          w: 6,
          h: 3,
          charts: [
            {
              title: 'Top 10 interests',
              type: 'radar',
              dataset: {
                type: 'otql',
                query_id: '50167',
              },
              options: {
                xKey: 'key',
                format: 'count',
                yKeys: [
                  {
                    key: 'value',
                    message: 'count',
                  },
                ],
              },
            },
          ],
        },
        {
          x: 6,
          y: 0,
          w: 6,
          h: 3,
          charts: [
            {
              title: 'Top 10 purchase intents',
              type: 'bars',
              dataset: {
                type: 'otql',
                query_id: '50173',
              },
              options: {
                xKey: 'key',
                format: 'count',
                yKeys: [
                  {
                    key: 'value',
                    message: 'count',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
