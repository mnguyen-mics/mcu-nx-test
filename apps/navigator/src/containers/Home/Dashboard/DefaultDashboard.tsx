export const defaultDashboard = {
  sections: [
    {
      title: '',
      cards: [
        {
          x: 0,
          charts: [
            {
              title: 'Active users (last 30 days)',
              type: 'metric',
              dataset: {
                type: 'activities_analytics',
                query_json: {
                  dimensions: [],
                  metrics: [
                    {
                      expression: 'users',
                    },
                  ],
                },
              },
            },
            {
              options: {
                hide_x_axis: true,
                colors: ['#D9D9D9'],
              },
              dataset: {
                type: 'format-dates',
                sources: [
                  {
                    type: 'activities_analytics',
                    query_json: {
                      dimensions: [
                        {
                          name: 'date_yyyymmdd',
                        },
                      ],
                      metrics: [
                        {
                          expression: 'users',
                        },
                      ],
                    },
                  },
                ],
                date_options: {
                  format: 'YYYY-MM-DD',
                },
              },
              title: 'Daily',
              type: 'Bars',
            },
          ],
          y: 0,
          h: 4,
          layout: 'vertical',
          w: 12,
        },
      ],
    },
  ],
};
