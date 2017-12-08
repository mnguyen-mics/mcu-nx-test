import * as React from 'react';
import { StackedAreaPlotDoubleAxis } from '../../../components/StackedAreaPlot';
import { EmptyCharts } from '../../../components/EmptyCharts/index';
import MetricsColumn from '../../../components/MetricsColumn';
import { formatMetric } from '../../../utils/MetricHelper';
import messages from '../Dashboard/messages';

interface DashboardVisitAreaChartProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
}

interface DashboardVisitAreaChartState {
  key1: string;
  key2: string;
  hasFetchedOverallStat?: boolean;
  isFetchingOverallStat?: boolean;
}

class DashboardVisitAreaChart extends React.Component<DashboardVisitAreaChartProps, DashboardVisitAreaChartState> {

  constructor(props: any) {
    super(props);

    this.state = {
      key1: 'min_duration',
      key2: 'max_duration',
    };
  }

  renderStackedAreaChart(report: any[], options: any) {
    return (
      <StackedAreaPlotDoubleAxis
        identifier='StackedAreaChartVisitOverview'
        dataset={report}
        options={options}
        style={{ flex: '1' }}
      />
    );
  }

  render() {
    const hasFetchedOverallStat = true;
    const isFetchingOverallStat = false;
    const overallStat = {
      users: 333,
      sessions: 403,
      bounce_rate: 0.041,
      session_duration: 30,
    };
    const { key1, key2 } = this.state;

    const metrics = [{
      name: 'Users',
      value: hasFetchedOverallStat ? formatMetric(overallStat.users, '0,0[.]00', '', '€') : undefined,
    }, {
      name: 'Sessions',
      value: hasFetchedOverallStat ? formatMetric(overallStat.sessions, '0,0[.]00', '', '€') : undefined,
    }, {
      name: 'Bounce Rate',
      value: hasFetchedOverallStat ? formatMetric(overallStat.bounce_rate, '0.000 %') : undefined,
    }, {
      name: 'Session Duration',
      value: hasFetchedOverallStat ? formatMetric(overallStat.session_duration, '0,0[.]00', '', '€') : undefined,
    }];

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: messages[key1] },
        { key: key2, message: messages[key2] },
      ],
      lookbackWindow: 30 * 24 * 60 * 60 * 1000, // lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df'],
    };

    const datasource = this.props.report;
    return (
      <div style={{ display: 'flex' }}>
        <MetricsColumn
            metrics={metrics}
            isLoading={isFetchingOverallStat || !hasFetchedOverallStat}
        />
        {datasource.length === 0 || !this.props.hasFetchedVisitReport
            // TODO INTL
            ? <EmptyCharts title="NO VISIT STAT" />
            : this.renderStackedAreaChart(datasource, optionsForChart)}
      </div>
    );
  }
}
export default DashboardVisitAreaChart;
