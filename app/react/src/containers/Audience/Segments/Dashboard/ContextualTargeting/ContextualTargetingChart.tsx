import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  AreaChartSlider,
  Card,
  EmptyChart,
  LoadingChart,
} from '@mediarithmics-private/mcs-components-library';
import { DataPoint } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart-slider/AreaChartSlider';
import { ContextualKeyResource } from './ContextualTargetingTab';
import { ContextualTargetingResource } from '../../../../../models/contextualtargeting/ContextualTargeting';
import { Button } from 'antd';
import { messages } from './messages';
import { compose } from 'recompose';

export interface ChartDataResource extends DataPoint {
  lift: number;
  reach: number;
}

const STEP_NUMBER = 100;

interface ContextualTargetingChartProps {
  contextualTargeting?: ContextualTargetingResource;
  isEditing: boolean;
  sortedContextualKeys?: ContextualKeyResource[];
  totalPageViewVolume?: number;
  onSliderChange: (point: DataPoint) => void;
  createContextualTargeting: () => void;
  getTargetedVolumeRatio: () => number;
}

type Props = ContextualTargetingChartProps & InjectedIntlProps;

interface State {
  isLoading: boolean;
  chartData?: ChartDataResource[];
  initialSliderIndex?: number;
}

class ContextualTargetingChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const { contextualTargeting, sortedContextualKeys, totalPageViewVolume } = this.props;
    if (
      contextualTargeting &&
      contextualTargeting.status !== 'INIT' &&
      sortedContextualKeys &&
      totalPageViewVolume
    )
      this.initChart(contextualTargeting, sortedContextualKeys, totalPageViewVolume);
  }

  componentDidUpdate(prevProps: Props) {
    const { contextualTargeting, sortedContextualKeys, totalPageViewVolume } = this.props;
    if (
      contextualTargeting &&
      contextualTargeting.status !== 'INIT' &&
      sortedContextualKeys &&
      totalPageViewVolume &&
      (sortedContextualKeys !== prevProps.sortedContextualKeys ||
        totalPageViewVolume !== prevProps.totalPageViewVolume)
    ) {
      this.initChart(contextualTargeting, sortedContextualKeys, totalPageViewVolume);
    }
  }

  buildChartData = (sortedContextualKeys: ContextualKeyResource[]) => {
    const chartData = [];
    const liftMax = sortedContextualKeys[0].lift;
    const liftMin = sortedContextualKeys[sortedContextualKeys.length - 1].lift;
    const liftStep = (liftMax - liftMin) / STEP_NUMBER;
    let cumulativeReach = 0;
    for (let i = 0; i < STEP_NUMBER; i++) {
      cumulativeReach += sortedContextualKeys
        .filter(ck => ck.lift > liftMax - liftStep * (i + 1) && ck.lift <= liftMax - liftStep * i)
        .reduce((acc, ck) => acc + ck.occurrences_in_datamart_count, 0);
      chartData[i] = { lift: liftMax - liftStep * (i + 1), reach: cumulativeReach / 1000000 };
    }
    return chartData;
  };

  initChart = (
    contextualTargeting: ContextualTargetingResource,
    sortedContextualKeys: ContextualKeyResource[],
    totalPageViewVolume: number,
  ) => {
    const { onSliderChange } = this.props;
    this.setState({
      isLoading: true,
    });
    const chartData = this.buildChartData(sortedContextualKeys);
    let initialSliderIndex: number;
    if (contextualTargeting && contextualTargeting.volume_ratio) {
      const ctReach = (contextualTargeting.volume_ratio * totalPageViewVolume) / 1000000;
      const index = chartData?.findIndex(data => ctReach <= data.reach);
      initialSliderIndex = index ? index : 20;
    } else {
      initialSliderIndex = 20;
    }
    onSliderChange(chartData[initialSliderIndex]);
    this.setState({
      initialSliderIndex: initialSliderIndex,
      chartData: chartData,
      isLoading: false,
    });
  };

  renderNoCtStep = () => {
    const { intl, createContextualTargeting } = this.props;
    return (
      <div className='mcs-contextualTargetingDashboard_noCtStep'>
        <EmptyChart
          title={intl.formatMessage(messages.noContextualTargetingTabText)}
          icon='optimization'
        />
        <Button className='mcs-primary' type='primary' onClick={createContextualTargeting}>
          {intl.formatMessage(messages.noContextualTargetingTabButton)}
        </Button>
      </div>
    );
  };

  renderInitializationStep = () => {
    const { intl } = this.props;
    return (
      <div className='mcs-contextualTargetingDashboard_initializationStep'>
        <EmptyChart
          title={intl.formatMessage(messages.InitializationTabText)}
          icon='optimization'
        />
        <span>{intl.formatMessage(messages.InitializationTabSubText)}</span>
      </div>
    );
  };

  tipFormater = (selected: DataPoint, index?: number) => {
    const { getTargetedVolumeRatio } = this.props;
    return <div>{Math.round(getTargetedVolumeRatio() * 100) + '% of total page views'}</div>;
  };

  renderDraftStepChart = () => {
    const { intl, onSliderChange, contextualTargeting, sortedContextualKeys, isEditing } =
      this.props;
    const { chartData, initialSliderIndex } = this.state;

    return chartData && initialSliderIndex ? (
      <Card className='mcs-contextualTargetingDashboard_graph'>
        <AreaChartSlider
          data={chartData}
          initialValue={initialSliderIndex}
          xAxis={{
            key: 'lift',
            labelFormat: '{value}',
            title: 'Lift',
            subtitle: 'Users in this segment consult this content x times more than other people',
            reversed: true,
          }}
          yAxis={{
            key: 'reach',
            labelFormat: '{value}M',
            title: 'Reach',
            subtitle: 'Page views over the past 30 days',
          }}
          color={'#00a1df'}
          onChange={onSliderChange}
          tipFormatter={this.tipFormater}
          disabled={
            (contextualTargeting?.status === 'LIVE' && !isEditing) ||
            contextualTargeting?.status === 'LIVE_PUBLISHED' ||
            contextualTargeting?.status === 'PUBLISHED'
          }
        />
      </Card>
    ) : sortedContextualKeys ? (
      <EmptyChart title={intl.formatMessage(messages.InitializationTabText)} icon='optimization' />
    ) : (
      <LoadingChart />
    );
  };

  render() {
    const { contextualTargeting } = this.props;

    if (!contextualTargeting) {
      return this.renderNoCtStep();
    } else if (contextualTargeting.status === 'INIT') {
      return this.renderInitializationStep();
    } else {
      return this.renderDraftStepChart();
    }
  }
}

export default compose<Props, ContextualTargetingChartProps>(injectIntl)(ContextualTargetingChart);
