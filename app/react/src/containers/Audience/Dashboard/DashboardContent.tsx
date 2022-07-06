import * as React from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import Count from './Vizualisation/Count';
import MapPieChart from './Vizualisation/MapPieChart';
import MapBarChart from './Vizualisation/MapBarChart';
import MapIndexChart from './Vizualisation/MapIndexChart';
import DateAggregationChart from './Vizualisation/DateAggregationChart';
import GaugePieChart from './Vizualisation/GaugePieChart';
import WorldMapChart from './Vizualisation/WorldMapChart';
import { AudienceSegmentShape } from '../../../models/audiencesegment/AudienceSegmentResource';
import CountBarChart from './Vizualisation/CountBarChart';
import Percentage from './Vizualisation/Percentage';
import CountPieChart from './Vizualisation/CountPieChart';
import TopInfo from './Vizualisation/TopInfo';
import MapRadarChart from './Vizualisation/MapRadarChart';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import {
  McsLazyLoad,
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';
import {
  Component,
  ComponentLayout,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/old-dashboards-model';

const BASE_FRAMEWORK_HEIGHT = 96;
const BASE_PADDING = 5;

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface Props {
  layout: ComponentLayout[];
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void;
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
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
    const { source, datamartId, queryExecutionSource, queryExecutionSubSource } = this.props;

    const height = this.computeHeight(layout.h);

    switch (comp.component_type) {
      case 'COUNT':
        return (
          <Count
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            datamartId={datamartId}
            title={comp.title}
            queryId={comp.query_id}
            precision={comp.precision}
          />
        );
      case 'PERCENTAGE':
        return (
          <Percentage
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            datamartId={datamartId}
            title={comp.title}
            queryId={comp.query_id}
            totalQueryId={comp.total_query_id}
            precision={comp.precision}
          />
        );
      case 'MAP_PIE_CHART':
        return (
          <MapPieChart
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            title={comp.title}
            queryId={comp.query_id}
            data={comp.data}
            datamartId={datamartId}
            labelsEnabled={comp.show_legend}
            height={height}
            precision={comp.precision}
          />
        );
      case 'MAP_BAR_CHART':
        return (
          <MapBarChart
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
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
            stacking={comp.stacking}
            drilldown={comp.drilldown}
            reducePadding={comp.reducePadding}
            precision={comp.precision}
          />
        );
      case 'MAP_INDEX_CHART':
        return (
          <MapIndexChart
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
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
            showTop={comp.showTop}
            minimumPercentage={comp.minimumPercentage}
            height={height}
            precision={comp.precision}
          />
        );
      case 'MAP_RADAR_CHART':
        return (
          <MapRadarChart
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
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
            precision={comp.precision}
          />
        );
      case 'DATE_AGGREGATION_CHART':
        return (
          <DateAggregationChart
            source={source}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            title={comp.title}
            queryIds={comp.query_ids}
            plotLabels={comp.plot_labels}
            datamartId={datamartId}
            height={height}
            format={comp.format}
            precision={comp.precision}
          />
        );
      case 'GAUGE_PIE_CHART':
        return (
          <GaugePieChart
            datamartId={datamartId}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            title={comp.title}
            queryIds={comp.query_ids}
            height={height}
            precision={comp.precision}
          />
        );
      case 'WORLD_MAP_CHART':
        return (
          <WorldMapChart
            title={comp.title}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            datamartId={datamartId}
            queryId={comp.query_id}
            height={height}
            precision={comp.precision}
          />
        );
      case 'COUNT_BAR_CHART':
        return (
          <CountBarChart
            title={comp.title}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            queryIds={comp.query_ids}
            datamartId={datamartId}
            labelsEnabled={true}
            height={height}
            plotLabels={comp.plot_labels}
            source={source}
            precision={comp.precision}
          />
        );
      case 'COUNT_PIE_CHART':
        return (
          <CountPieChart
            datamartId={datamartId}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            height={height}
            labelsEnabled={comp.labels_enabled}
            plotLabels={comp.plot_labels}
            queryIds={comp.query_ids}
            title={comp.title}
            source={source}
            precision={comp.precision}
          />
        );
      case 'TOP_INFO_COMPONENT':
        return (
          <TopInfo
            datamartId={datamartId}
            queryExecutionSource={queryExecutionSource}
            queryExecutionSubSource={queryExecutionSubSource}
            title={comp.title}
            queryId={comp.query_id}
            source={source}
            precision={comp.precision}
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
          <McsLazyLoad child={this.generateComponent(comp, layout) || <div />} />
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
