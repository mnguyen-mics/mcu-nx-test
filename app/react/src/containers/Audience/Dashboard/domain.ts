import { Layout } from 'react-grid-layout';

export interface ComponentLayout {
  layout: Layout;
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
  clause_id: string;
  labels_enabled?: boolean;
}

export interface ComponentCountBar extends BaseComponent {
  component_type: 'COUNT_BAR_CHART';
  show_legend: boolean;
  clause_ids: string[];
  labels_enabled?: boolean;
}

export interface ComponentCount extends BaseComponent {
  component_type: 'COUNT';
  clause_id: string;
  prefix?: string;
  suffix?: string;
}

export interface GaugeComponent extends BaseComponent {
  component_type: 'GAUGE_PIE_CHART';
  clause_ids: string[];
  show_percentage: boolean;
}

export interface MapStackedBarChart extends BaseComponent {
  component_type: 'MAP_STACKED_BAR_CHART';
  clause_ids: string[];
  keys: string[];
  show_legend: boolean;
  labels_enabled?: boolean;
}

export interface WorldMapChart extends BaseComponent {
  component_type: 'WORLD_MAP_CHART';
  clause_id: string;
}

export type Component =
  | ComponentChart
  | ComponentCount
  | GaugeComponent
  | MapStackedBarChart
  | WorldMapChart
  | ComponentCountBar;

type ComponentType =
  | 'MAP_BAR_CHART'
  | 'MAP_PIE_CHART'
  | 'DATE_AGGREGATION_CHART'
  | 'COUNT'
  | 'GAUGE_PIE_CHART'
  | 'MAP_STACKED_BAR_CHART'
  | 'WORLD_MAP_CHART'
  | 'COUNT_BAR_CHART';

export const deterministicLayout: ComponentLayout[] = [
  {
    layout: {
      h: 2,
      i: '2',
      static: false,
      w: 3,
      x: 0,
      y: 0,
    },
    component: {
      component_type: 'GAUGE_PIE_CHART',
      datamart_id: '1393',
      clause_ids: ['22447', '22448'], // clause ids
      title: 'Gender',
      show_percentage: true,
    },
  },
  {
    layout: {
      h: 2,
      i: '8',
      static: false,
      w: 3,
      x: 3,
      y: 0,
    },
    component: {
      component_type: 'COUNT_BAR_CHART',
      show_legend: false,
      datamart_id: '1393',
      clause_ids: ['21825'],
      title: 'Age',
    },
  },
  {
    layout: {
      h: 2,
      i: '7',
      static: true,
      w: 3,
      x: 6,
      y: 0,
    },
    component: {
      component_type: 'WORLD_MAP_CHART',
      // show_legend: false,
      datamart_id: '1393',
      clause_id: '21823',
      title: 'Location',
    },
  },
  {
    layout: {
      h: 2,
      i: '3',
      static: false,
      w: 3,
      x: 9,
      y: 0,
    },
    component: {
      component_type: 'COUNT_BAR_CHART',
      datamart_id: '1390',
      clause_ids: ['21818'],
      title: 'Reader status',
      show_legend: false,
      labels_enabled: true,
    },
  },
  {
    layout: {
      h: 2,
      i: '4',
      static: false,
      w: 4,
      x: 0,
      y: 2,
    },
    component: {
      component_type: 'MAP_PIE_CHART',
      datamart_id: '1390',
      clause_id: '21818',
      title: 'Author interaction',
      show_legend: false,
      labels_enabled: true,
    },
  },
  {
    layout: {
      h: 2,
      i: '5',
      static: false,
      w: 4,
      x: 4,
      y: 2,
    },
    component: {
      component_type: 'MAP_PIE_CHART',
      datamart_id: '1390',
      clause_id: '21818',
      title: 'Page type interaction',
      show_legend: false,
      labels_enabled: true,
    },
  },
  {
    layout: {
      h: 2,
      i: '6',
      static: false,
      w: 4,
      x: 8,
      y: 2,
    },
    component: {
      component_type: 'MAP_PIE_CHART',
      datamart_id: '1390',
      clause_id: '21818',
      title: 'Category interaction',
      show_legend: false,
      labels_enabled: true,
    },
  },
];

export const probabilisticLayout: ComponentLayout[] = [
  {
    layout: {
      h: 3,
      i: '2',
      static: false,
      w: 4,
      x: 0,
      y: 0,
    },
    component: {
      component_type: 'GAUGE_PIE_CHART',
      datamart_id: '1393',
      clause_ids: ['21805'],
      title: 'Gender',
      show_percentage: true,
    },
  },
  {
    layout: {
      h: 3,
      i: '8',
      static: false,
      w: 4,
      x: 4,
      y: 0,
    },
    component: {
      component_type: 'COUNT_BAR_CHART',
      show_legend: false,
      datamart_id: '1393',
      clause_ids: ['21825'],
      title: 'Age',
    },
  },
  {
    layout: {
      h: 3,
      i: '7',
      static: false,
      w: 4,
      x: 8,
      y: 0,
    },
    component: {
      component_type: 'WORLD_MAP_CHART',
      // show_legend: false,
      datamart_id: '1393',
      clause_id: '21823',
      title: 'Location',
    },
  },
];
