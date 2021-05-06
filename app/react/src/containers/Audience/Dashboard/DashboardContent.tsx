import * as React from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import Count from './Vizualisation/Count';
import MapPieChart from './Vizualisation/MapPieChart';
import MapBarChart from './Vizualisation/MapBarChart';
import DateAggregationChart from './Vizualisation/DateAggregationChart';
import GaugePieChart from './Vizualisation/GaugePieChart';
import WorldMapChart from './Vizualisation/WorldMapChart';
import { AudienceSegmentShape } from '../../../models/audiencesegment/AudienceSegmentResource';
import CountBarChart from './Vizualisation/CountBarChart';
import { ComponentLayout, Component } from '../../../models/dashboards/dashboards';
import Percentage from './Vizualisation/Percentage';
import CountPieChart from './Vizualisation/CountPieChart';
import TopInfo from './Vizualisation/TopInfo';
import MapRadarChart from './Vizualisation/MapRadarChart';
import { AudienceBuilderQueryDocument } from '../../../models/audienceBuilder/AudienceBuilderResource';

const BASE_FRAMEWORK_HEIGHT = 96;
const BASE_PADDING = 5;

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface Props {
  layout: ComponentLayout[];
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void;
  source?: AudienceSegmentShape | AudienceBuilderQueryDocument;
  datamartId: string;
}

interface State {
  currentBreakpoint: string;
  compactType: 'vertical' | 'horizontal' | null;
  mounted: boolean;
}

export default class DashboardContent extends React.Component<Props, State> {
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

  generateComponent = (comp: Component, layout: Layout) => {
    const { source, datamartId } = this.props;

    const height = this.computeHeight(layout.h);

    switch (comp.component_type) {
      case 'COUNT':
        return (
          <Count
            source={source}
            datamartId={datamartId}
            title={comp.title}
            queryId={comp.query_id}
          />
        );
      case 'PERCENTAGE':
        return (
          <Percentage
            source={source}
            datamartId={datamartId}
            title={comp.title}
            queryId={comp.query_id}
            totalQueryId={comp.total_query_id}
          />
        );
      case 'MAP_PIE_CHART':
        return (
          <MapPieChart
            source={source}
            title={comp.title}
            queryId={comp.query_id}
            data={comp.data}
            datamartId={datamartId}
            labelsEnabled={comp.show_legend}
            height={height}
          />
        );
      case 'MAP_BAR_CHART':
        return (
          <MapBarChart
            source={source}
            datamartId={datamartId}
            queryId={comp.query_id}
            title={comp.title}
            labelsEnabled={comp.labels_enabled}
            shouldCompare={comp.shouldCompare}
            percentage={comp.percentage}
            vertical={comp.vertical}
            sortKey={comp.sortKey}
            data={comp.data}
            labels={comp.labels}
            tooltip={comp.tooltip}
            height={height}
          />
        );
      case 'MAP_RADAR_CHART':
        return (
          <MapRadarChart
            source={source}
            datamartId={datamartId}
            queryId={comp.query_id}
            title={comp.title}
            labelsEnabled={comp.labels_enabled}
            shouldCompare={comp.shouldCompare}
            percentage={comp.percentage}
            vertical={comp.vertical}
            sortKey={comp.sortKey}
            labels={comp.labels}
            data={comp.data}
            tooltip={comp.tooltip}
          />
        );
      case 'DATE_AGGREGATION_CHART':
        return (
          <DateAggregationChart
            source={source}
            title={comp.title}
            queryIds={comp.query_ids}
            plotLabels={comp.plot_labels}
            datamartId={datamartId}
            height={height}
            format={comp.format}
          />
        );
      case 'GAUGE_PIE_CHART':
        return (
          <GaugePieChart
            datamartId={datamartId}
            title={comp.title}
            queryIds={comp.query_ids}
            height={height}
          />
        );
      case 'WORLD_MAP_CHART':
        return (
          <WorldMapChart
            title={comp.title}
            datamartId={datamartId}
            queryId={comp.query_id}
            height={height}
          />
        );
      case 'COUNT_BAR_CHART':
        return (
          <CountBarChart
            title={comp.title}
            queryIds={comp.query_ids}
            datamartId={datamartId}
            labelsEnabled={true}
            height={height}
            plotLabels={comp.plot_labels}
          />
        );
      case 'COUNT_PIE_CHART':
        return (
          <CountPieChart
            datamartId={datamartId}
            height={height}
            labelsEnabled={comp.labels_enabled}
            plotLabels={comp.plot_labels}
            queryIds={comp.query_ids}
            title={comp.title}
          />
        );
      case 'TOP_INFO_COMPONENT':
        return (
          <TopInfo
            datamartId={datamartId}
            title={comp.title}
            queryId={comp.query_id}
            source={source}
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
          key={i.toString()}
          className={layout.static ? 'static' : ''}
          style={{ backgroundColor: '#fff' }}
        >
          {this.generateComponent(comp, layout)}
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
  }

  computeHeight = (h: number) => {
    return BASE_FRAMEWORK_HEIGHT * h + (h > 1 ? h * BASE_PADDING : 0) - 51;
  };

  render() {
    const layouts = this.props.layout.map((cl, i) => ({
      ...cl.layout,
      i: i.toString(),
    }));
    return (
      <ResponsiveReactGridLayout
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        layouts={{ lg: layouts }}
        onBreakpointChange={this.onBreakpointChange}
        measureBeforeMount={false}
        useCSSTransforms={this.state.mounted}
        compactType={this.state.compactType}
        preventCollision={!this.state.compactType}
        // Disable dragging & resizabling
        isDraggable={false}
        isResizable={false}
        rowHeight={BASE_FRAMEWORK_HEIGHT}
      >
        {this.generateDOM()}
      </ResponsiveReactGridLayout>
    );
  }
}
