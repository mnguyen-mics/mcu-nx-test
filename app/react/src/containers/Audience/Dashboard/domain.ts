import { Layout } from 'react-grid-layout';
import { AudienceSegmentShape } from '../../../models/audiencesegment';
import { isUserQuerySegment, isUserListSegment } from '../Segments/Edit/domain';
import { DataResponse } from '../../../services/ApiService';
import { IQueryService } from '../../../services/QueryService';

export interface ComponentLayout {
  layout: Layout;
  component: Component;
}

export interface BaseComponent {
  id: number;
  component_type: ComponentType;
  title: string;
  description?: string;
}

export interface ComponentChart extends BaseComponent {
  component_type: 'MAP_BAR_CHART' | 'MAP_PIE_CHART' | 'DATE_AGGREGATION_CHART';
  show_legend: boolean;
  chart_id: string;
  labels_enabled?: boolean;
}

export interface ComponentCountBar extends BaseComponent {
  component_type: 'COUNT_BAR_CHART';
  show_legend: boolean;
  chart_ids: string[];
  labels_enabled?: boolean;
  type: 'age_det' | 'reader_status' | 'age_prob';
}

export interface ComponentCount extends BaseComponent {
  component_type: 'COUNT';
  chart_id: string;
  prefix?: string;
  suffix?: string;
}

export interface GaugeComponent extends BaseComponent {
  component_type: 'GAUGE_PIE_CHART';
  chart_ids: string[];
  show_percentage: boolean;
}

export interface MapStackedBarChart extends BaseComponent {
  component_type: 'MAP_STACKED_BAR_CHART';
  chart_ids: string[];
  keys: string[];
  show_legend: boolean;
  labels_enabled?: boolean;
}

export interface WorldMapChart extends BaseComponent {
  component_type: 'WORLD_MAP_CHART';
  chart_id: string;
}

export type Component =
  | ComponentChart
  | ComponentCount
  | GaugeComponent
  | MapStackedBarChart
  | WorldMapChart
  | ComponentCountBar;

export type ComponentType =
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
      h: 3,
      i: '2',
      static: false,
      w: 3,
      x: 0,
      y: 0,
    },
    component: {
      id: 0,
      component_type: 'GAUGE_PIE_CHART',
      chart_ids: ['22458', '22459'],
      title: 'Gender',
      show_percentage: true,
    },
  },
  {
    layout: {
      h: 3,
      i: '8',
      static: false,
      w: 3,
      x: 3,
      y: 0,
    },
    component: {
      id: 1,
      component_type: 'COUNT_BAR_CHART',
      show_legend: false,
      chart_ids: ['22465', '22466', '22467', '22468', '22469'],
      title: 'Age',
      type: 'age_det',
    },
  },
  {
    layout: {
      h: 3,
      i: '7',
      static: false,
      w: 3,
      x: 6,
      y: 0,
    },
    component: {
      id: 2,
      component_type: 'WORLD_MAP_CHART',
      // show_legend: false,
      chart_id: '22470',
      title: 'Location',
    },
  },
  {
    layout: {
      h: 3,
      i: '3',
      static: false,
      w: 3,
      x: 9,
      y: 0,
    },
    component: {
      id: 3,
      component_type: 'COUNT_BAR_CHART',
      chart_ids: ['22472', '22473', '22474'],
      title: 'Reader status',
      show_legend: false,
      labels_enabled: true,
      type: 'reader_status',
    },
  },
  {
    layout: {
      h: 3,
      i: '4',
      static: false,
      w: 4,
      x: 0,
      y: 3,
    },
    component: {
      id: 4,
      component_type: 'MAP_PIE_CHART',
      chart_id: '22478',
      title: 'Author interaction',
      show_legend: false,
      labels_enabled: true,
    },
  },
  {
    layout: {
      h: 3,
      i: '5',
      static: false,
      w: 4,
      x: 4,
      y: 3,
    },
    component: {
      id: 5,
      component_type: 'MAP_PIE_CHART',
      chart_id: '22479',
      title: 'Page type interaction',
      show_legend: false,
      labels_enabled: true,
    },
  },
  {
    layout: {
      h: 3,
      i: '6',
      static: false,
      w: 4,
      x: 8,
      y: 3,
    },
    component: {
      id: 6,
      component_type: 'MAP_PIE_CHART',
      chart_id: '22480',
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
      w: 6,
      x: 0,
      y: 0,
    },
    component: {
      id: 0,
      component_type: 'GAUGE_PIE_CHART',
      chart_ids: ['22481', '22482'],
      title: 'Gender',
      show_percentage: true,
    },
  },
  {
    layout: {
      h: 3,
      i: '8',
      static: false,
      w: 6,
      x: 6,
      y: 0,
    },
    component: {
      id: 1,
      component_type: 'COUNT_BAR_CHART',
      show_legend: false,
      chart_ids: ['22483', '22484', '22485', '22486', '22487'],
      title: 'Age',
      type: 'age_prob',
    },
  },
];

export const getWhereClausePromise = (
  datamartId: string,
  segment: AudienceSegmentShape,
  queryService: IQueryService,
) => {
  let whereClausePromise: Promise<DataResponse<string> | string>;
  if (isUserQuerySegment(segment) && segment.query_id) {
    whereClausePromise = queryService.getWhereClause(
      datamartId,
      segment.query_id,
    );
  } else if (isUserListSegment(segment)) {
    whereClausePromise = Promise.resolve(`segments { id = \"${segment.id}\"}`);
  } else {
    whereClausePromise = Promise.resolve('');
  }
  return whereClausePromise;
};
