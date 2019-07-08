export type LayoutShape = Rows[];

export interface Rows {
  columns: Column[];
  size?: 1 | 2 | 3;
}

export interface Column {
  span: number;
  components: ComponentWrapper[];
}

export interface ComponentWrapper {
  height: number;
  component: Component;
}

export interface BaseComponent {
  datamart_id: string;
  component_type: ComponentType;
  title: string;
  description?: string;
}

export interface ComponentChart extends BaseComponent {
  component_type: 'MAP_BAR_CHART' | 'MAP_PIE_CHART' | 'DATE_AGGREGATION_CHART';
  show_legend: boolean;
  query_id: string;
  labels_enabled?: boolean
}

export interface ComponentCount extends BaseComponent {
  component_type: 'COUNT';
  query_id: string;
  prefix?: string;
  suffix?: string;
}

export interface GaugeComponent extends BaseComponent {
  component_type: 'GAUGE_PIE_CHART';
  total_query_id: string;
  partial_query_id: string;
  show_percentage: boolean;
}

export interface MapStackedBarChart extends BaseComponent {
  component_type: 'MAP_STACKED_BAR_CHART';
  query_ids: string[];
  keys: string[];
  show_legend: boolean;
  labels_enabled?: boolean
}

export type Component = ComponentChart | ComponentCount | GaugeComponent | MapStackedBarChart;

type ComponentType =
  | 'MAP_BAR_CHART'
  | 'MAP_PIE_CHART'
  | 'DATE_AGGREGATION_CHART'
  | 'COUNT'
  | 'GAUGE_PIE_CHART'
  | 'MAP_STACKED_BAR_CHART';

  

export const layout1393: LayoutShape = [
  {
    size: 1,
    columns: [
      {
        span: 6,
        components: [
          {
            height: 2,
            component: {
              component_type: 'COUNT',
              datamart_id: '1393',
              query_id: '21805',
              title: 'Selected Unique IDs',
            },
          },
          {
            height: 2,
            component: {
              component_type: 'COUNT',
              datamart_id: '1393',
              query_id: '21805',
              title: 'Total Unique IDs',
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1393',
              partial_query_id: '21807',
              total_query_id: '21805',
              title: 'Global Pragmatists',
              show_percentage: true,
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1393',
              partial_query_id: '21809',
              total_query_id: '21805',
              title: 'Present First',
              show_percentage: true,
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1393',
              partial_query_id: '21809',
              total_query_id: '21811',
              title: 'Tech-Oriented"',
              show_percentage: true,
            },
          },
        ],
      },
    ],
  },
  {
    size: 2,
    columns: [
      {
        span: 6,
        components: [
          {
            height: 2,
            component: {
              component_type: 'MAP_PIE_CHART',
              datamart_id: '1393',
              query_id: '21819',
              title: 'Home Owner Status',
              show_legend: false,
              labels_enabled: true
            },
          },
          {
            height: 2,
            component: {
              component_type: 'MAP_PIE_CHART',
              datamart_id: '1393',
              query_id: '21821',
              title: 'Parental Status',
              show_legend: false,
              labels_enabled: true
            },
          },
        ],
      },
      {
        span: 9,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_STACKED_BAR_CHART',
              show_legend: false,
              datamart_id: '1393',
              query_ids: ['21815', '21817'],
              keys: ['male', 'female'],
              title: 'Demographics',
            },
          },
        ],
      },
      {
        span: 9,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1393',
              query_id: '21823',
              title: 'Interest Group',
            },
          },
        ],
      },
    ],
  },
  {
    size: 2,
    columns: [
      {
        span: 12,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1393',
              query_id: '21825',
              title: 'Country Breakdown',
            }
          }
        ]
      },
      {
        span: 12,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1393',
              query_id: '21827',
              title: 'App Category Breakdown',
            }
          }
        ]
      }
    ]
  }
];

export const layout1394: LayoutShape = [
  {
    size: 1,
    columns: [
      {
        span: 6,
        components: [
          {
            height: 2,
            component: {
              component_type: 'COUNT',
              datamart_id: '1394',
              query_id: '21804',
              title: 'Selected Unique IDs',
            },
          },
          {
            height: 2,
            component: {
              component_type: 'COUNT',
              datamart_id: '1394',
              query_id: '21804',
              title: 'Total Unique IDs',
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1394',
              partial_query_id: '21806',
              total_query_id: '21804',
              title: 'Global Pragmatists',
              show_percentage: true,
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1394',
              partial_query_id: '21808',
              total_query_id: '21804',
              title: 'Present First',
              show_percentage: true,
            },
          },
        ],
      },
      {
        span: 6,
        components: [
          {
            height: 1,
            component: {
              component_type: 'GAUGE_PIE_CHART',
              datamart_id: '1394',
              partial_query_id: '21810',
              total_query_id: '21804',
              title: 'Tech-Oriented"',
              show_percentage: true,
            },
          },
        ],
      },
    ],
  },
  {
    size: 2,
    columns: [
      {
        span: 6,
        components: [
          {
            height: 2,
            component: {
              component_type: 'MAP_PIE_CHART',
              datamart_id: '1394',
              query_id: '21818',
              title: 'Home Owner Status',
              show_legend: false,
              labels_enabled: true
            },
          },
          {
            height: 2,
            component: {
              component_type: 'MAP_PIE_CHART',
              datamart_id: '1394',
              query_id: '21820',
              title: 'Parental Status',
              show_legend: false,
              labels_enabled: true
            },
          },
        ],
      },
      {
        span: 9,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_STACKED_BAR_CHART',
              show_legend: false,
              datamart_id: '1394',
              query_ids: ['21814', '21816'],
              keys: ['male', 'female'],
              title: 'Demographics',
            },
          },
        ],
      },
      {
        span: 9,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1394',
              query_id: '21822',
              title: 'Interest Group',
            },
          },
        ],
      },
    ],
  },
  {
    size: 2,
    columns: [
      {
        span: 12,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1394',
              query_id: '21824',
              title: 'Country Breakdown',
            }
          }
        ]
      },
      {
        span: 12,
        components: [
          {
            height: 1,
            component: {
              component_type: 'MAP_BAR_CHART',
              show_legend: false,
              datamart_id: '1394',
              query_id: '21826',
              title: 'App Category Breakdown',
            }
          }
        ]
      }
    ]
  }
];
