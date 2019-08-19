import * as React from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { Component, ComponentLayout } from './domain';
import Count from './Vizualisation/Count';
import MapPieChart from './Vizualisation/MapPieChart';
import MapBarChart from './Vizualisation/MapBarChart';
import DateAggregationChart from './Vizualisation/DateAggregationChart';
import GaugePieChart from './Vizualisation/GaugePieChart';
import WorldMapChart from './Vizualisation/WorldMapChart';
import { AudienceSegmentShape } from '../../../models/audiencesegment/AudienceSegmentResource';
import CountBarChart from './Vizualisation/CountBarChart';
import { BASE_CHART_HEIGHT } from '../../../components/Charts/domain';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface Props {
  layout: ComponentLayout[];
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void;
  segment: AudienceSegmentShape;
}

interface State {
  currentBreakpoint: string;
  compactType: 'vertical' | 'horizontal' | null;
  mounted: boolean;
  componentHeights: number[];
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
      componentHeights: [
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
        BASE_CHART_HEIGHT,
      ],
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  generateComponent = (comp: Component) => {
    const { segment } = this.props;
    const { componentHeights } = this.state;
    switch (comp.component_type) {
      case 'COUNT':
        return (
          <Count
            segment={segment}
            title={comp.title}
            chartQueryId={comp.chart_id}
          />
        );
      case 'MAP_PIE_CHART':
        return (
          <MapPieChart
            segment={segment}
            title={comp.title}
            chartQueryId={comp.chart_id}
            showLegend={comp.show_legend}
            labelsEnabled={comp.labels_enabled}
            height={componentHeights[comp.id]}
          />
        );
      case 'MAP_BAR_CHART':
        return (
          <MapBarChart
            segment={segment}
            title={comp.title}
            labelsEnabled={comp.labels_enabled}
            chartQueryId={comp.chart_id}
          />
        );
      case 'DATE_AGGREGATION_CHART':
        return (
          <DateAggregationChart
            segment={segment}
            title={comp.title}
            chartQueryId={comp.chart_id}
          />
        );
      case 'GAUGE_PIE_CHART':
        return (
          <GaugePieChart
            segment={segment}
            title={comp.title}
            chartQueryIds={comp.chart_ids}
            height={componentHeights[comp.id]}
          />
        );
      case 'WORLD_MAP_CHART':
        return (
          <WorldMapChart
            segment={segment}
            title={comp.title}
            chartQueryId={comp.chart_id}
            height={componentHeights[comp.id]}
          />
        );
      case 'COUNT_BAR_CHART':
        return (
          <CountBarChart
            segment={segment}
            title={comp.title}
            chartQueryIds={comp.chart_ids}
            labelsEnabled={true}
            type={comp.type}
            height={componentHeights[comp.id]}
          />
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
    window.dispatchEvent(new Event('resize'));
    const componentHeights = layout.map(l => (BASE_CHART_HEIGHT * l.h) / 3);
    this.setState({
      componentHeights: componentHeights,
    });
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
