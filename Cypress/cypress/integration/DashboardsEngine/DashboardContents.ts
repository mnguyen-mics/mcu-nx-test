export const differentChartsContent = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Bars',
                type: 'bars',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
              {
                title: 'Metric',
                type: 'Metric',
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
                title: 'Pie',
                type: 'pie',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
        ],
      },
      {
        title: 'Second Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            charts: [
              {
                title: 'Radar',
                type: 'radar',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
              {
                title: 'Unknown',
                type: 'unknown',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
};

export const indexTransformationContent = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Index',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  legend: {
                    position: 'bottom',
                    enabled: true,
                  },
                  bigBars: true,
                  stacking: false,
                  plotLineValue: 100,
                },
              },
              {
                title: 'Index Hidden Axis',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  hideXAxis: true,
                  hideYAxis: true,
                },
              },
              {
                title: 'Index Min Percentage',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 100,
                  },
                },
                options: {
                  format: 'index',
                },
              },
            ],
          },
        ],
      },
      {
        title: 'Second Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Index',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  legend: {
                    position: 'bottom',
                    enabled: true,
                  },
                  bigBars: true,
                  stacking: false,
                  plotLineValue: 100,
                  type: 'bar',
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export const standardSegmentDashboardContent = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Index',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  legend: {
                    position: 'bottom',
                    enabled: true,
                  },
                  bigBars: true,
                  stacking: false,
                  plotLineValue: 100,
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export const drawerChartDetails = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Bars',
                type: 'bars',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
              {
                title: 'Metric',
                type: 'Metric',
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
                title: 'Pie',
                type: 'pie',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
        ],
      },
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Index First',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  legend: {
                    position: 'bottom',
                    enabled: true,
                  },
                  bigBars: true,
                  stacking: false,
                  plotLineValue: 100,
                },
              },
              {
                title: 'Index Hidden Axis',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 0,
                  },
                },
                options: {
                  format: 'index',
                  hideXAxis: true,
                  hideYAxis: true,
                },
              },
              {
                title: 'Index Min Percentage',
                type: 'bars',
                dataset: {
                  type: 'index',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                    {
                      type: 'otql',
                      series_title: 'segment',
                      query_id: `${queryId}`,
                    },
                  ],
                  options: {
                    minimum_percentage: 100,
                  },
                },
                options: {
                  format: 'index',
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export const getDecoratosTransformationContent = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Pie',
                type: 'pie',
                dataset: {
                  type: 'get-decorators',
                  sources: [
                    {
                      type: 'otql',
                      series_title: 'datamart',
                      query_id: `${queryId}`,
                    },
                  ],
                  decorators_options: {
                    model_type: 'CHANNELS',
                  },
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
        ],
      },
    ],
  };
};

export const compartmentFilterContent = (queryId: string) => {
  return {
    sections: [
      {
        title: 'First Section',
        cards: [
          {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
            layout: 'horizontal',
            charts: [
              {
                title: 'Pie',
                type: 'pie',
                dataset: {
                  type: 'otql',
                  query_id: `${queryId}`,
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
        ],
      },
    ],
    available_filters: [
      {
        technical_name: 'channels',
        title: 'Channel',
        values_retrieve_method: 'query',
        values_query: 'SELECT {channel_id @map} FROM UserActivity',
        multi_select: true,
        query_fragments: [
          {
            type: 'OTQL',
            starting_object_type: 'UserActivity',
            fragment: 'channel_id IN $values',
          },
        ],
      },
    ],
  };
};
