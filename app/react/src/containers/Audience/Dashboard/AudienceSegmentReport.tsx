import * as React from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { Component, ComponentLayout } from './domain';
import Count from './Vizualisation/Count';
import MapPieChart from './Vizualisation/MapPieChart';
import MapBarChart from './Vizualisation/MapBarChart';
import DateAggregationChart from './Vizualisation/DateAggregationChart';
import GaugePieChart from './Vizualisation/GaugePieChart';
import MapStackedBarChart from './Vizualisation/MapStackedBarChart';
import WorldMapChart from './Vizualisation/WorldMapChart';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import CountBarChart from './Vizualisation/CountBarChart';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface Props {
  layout: ComponentLayout[];
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void;
  segment: UserQuerySegment;
}

interface State {
  currentBreakpoint: string;
  compactType: 'vertical' | 'horizontal' | null;
  mounted: boolean;
}

export default class AudienceSegmentReport extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentBreakpoint: 'lg',
      compactType: 'vertical',
      mounted: false,
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  generateComponent = (comp: Component) => {
    const { segment } = this.props;
    switch (comp.component_type) {
      case 'COUNT':
        return (
          segment.query_id && (
            <Count
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              clauseId={comp.clause_id}
            />
          )
        );
      case 'MAP_PIE_CHART':
        return (
          segment.query_id && (
            <MapPieChart
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              clauseId={comp.clause_id}
              showLegend={comp.show_legend}
              labelsEnabled={comp.labels_enabled}
            />
          )
        );
      case 'MAP_BAR_CHART':
        return (
          segment.query_id && (
            <MapBarChart
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              labelsEnabled={comp.labels_enabled}
              clauseId={comp.clause_id}
            />
          )
        );
      case 'DATE_AGGREGATION_CHART':
        return (
          segment.query_id && (
            <DateAggregationChart
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              clauseId={comp.clause_id}
            />
          )
        );
      case 'GAUGE_PIE_CHART':
        return (
          segment.query_id && (
            <GaugePieChart
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              clauseIds={comp.clause_ids}
              showPercentage={comp.show_percentage}
            />
          )
        );
      case 'MAP_STACKED_BAR_CHART':
        return (
          segment.query_id && (
            <MapStackedBarChart
              datamartId={segment.datamart_id}
              keys={comp.keys}
              clauseIds={comp.clause_ids}
              queryId={segment.query_id}
              title={comp.title}
            />
          )
        );
      case 'WORLD_MAP_CHART':
        return (
          segment.query_id && (
            <WorldMapChart
              datamartId={segment.datamart_id}
              title={comp.title}
              clauseId={comp.clause_id}
              queryId={segment.query_id}
            />
          )
        );
      case 'COUNT_BAR_CHART':
        return (
          segment.query_id && (
            <CountBarChart
              datamartId={segment.datamart_id}
              title={comp.title}
              queryId={segment.query_id}
              clauseIds={comp.clause_ids}
            />
          )
        );
      default:
        return null;
    }
  };

  generateDOM() {
    return _.map(this.props.layout, (compLayout, i) => {
      const comp = compLayout.component;
      const layout = compLayout.layout;
      return (
        <div
          key={layout.i}
          className={layout.static ? 'static' : ''}
          style={{ backgroundColor: '#fff' }}
        >
          {this.generateComponent(comp)}
        </div>
      );
    });
  }

  onBreakpointChange(breakpoint: string) {
    this.setState({
      currentBreakpoint: breakpoint,
    });
  }

  onLayoutChange(layout: Layout[], layouts: Layouts) {
    this.props.onLayoutChange(layout, layouts);
  }

  render() {
    const layouts = this.props.layout.map(cl => cl.layout);
    return (
      <ResponsiveReactGridLayout
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        layouts={{ lg: layouts }}
        onBreakpointChange={this.onBreakpointChange}
        onLayoutChange={this.onLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={this.state.mounted}
        compactType={this.state.compactType}
        preventCollision={!this.state.compactType}
      >
        {this.generateDOM()}
      </ResponsiveReactGridLayout>
    );
  }
}
