import * as React from 'react';

import { EmptyCharts } from '../../../components/EmptyCharts/index';
import MetricsColumn from '../../../components/MetricsColumn';
import { formatMetric } from '../../../utils/MetricHelper';
import { LegendChartWithModal } from '../../../components/LegendChart';
import messages from '../Dashboard/messages';
import StackedAreaPlotDoubleAxis from '../../../components/StackedAreaPlot/StackedAreaPlotDoubleAxis';
import Col from 'antd/lib/grid/col';
import Row from 'antd/lib/grid/row';

interface VisitAnalysisProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  lookbackWindow: number;
}
type JoinedProps = VisitAnalysisProps;

interface VisitAnalysisState {
  key1: string;
  key2: string;
}

const _messages: { [s: string]: any } = messages;

class VisitAnalysis extends React.Component<JoinedProps, VisitAnalysisState> {

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
        identifier="StackedAreaChartVisitOverview"
        dataset={report}
        options={options}
        style={{ flex: '1' }}
      />
    );
  }

  createLegend() {
    const keys = ['max_duration', 'min_duration', 'unique_user', 'count', 'unique_visitor'];
    return keys.map(key => {
      return {
        key: key,
        domain: _messages[key].defaultMessage,
      };
    });
  }

  extractUsers(report: any[]) {
   if (report)
    return report.reduce((accu: number, row: any) => { return accu + row.count; }, 0);
  }

  extractSessionDuration(report: any[]) {
    if (report)
      return report.reduce((accu: number, row: any) => { return accu + row.min_duration; }, 0);
  }

  render() {
    const { report, lookbackWindow, hasFetchedVisitReport, isFetchingVisitReport } = this.props;
    const { key1, key2 } = this.state;

    const metrics = [{
      name: 'Users',
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: 'Sessions',
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: 'Bounce Rate',
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: 'Session Duration',
      value: hasFetchedVisitReport ? formatMetric(this.extractSessionDuration(report), '0') : undefined,
    }];

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: _messages[key1] },
        { key: key2, message: _messages[key2] },
      ],
      lookbackWindow: lookbackWindow,
      colors: ['#ff9012', '#00a1df'],
    };

    const legendOptions = [
      {
        key: key1,
        // TODO INTL
        domain: _messages[key1].defaultMessage, // translations[key1.toUpperCase()],
        // TODO COLOR
        color: '#ff9012', // colors['mcs-warning'],
      },
      {
        key: key2,
        // TODO INTL
        domain: _messages[key2].defaultMessage, // translations[key2.toUpperCase()],
        // TODO COLOR
        color: '#00a1df', // colors['mcs-info'],
      },
    ];
    const legends = this.createLegend();

    const onLegendChange = (a: string, b: string) => this.setState((previousState: VisitAnalysisState) => {
      return {
        ...previousState,
        key1: a,
        key2: b,
      };
    });
    const datasource = report;
    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {datasource && datasource.length === 0 && (hasFetchedVisitReport)
              ? <div />
              : <LegendChartWithModal
                identifier="chartLegend"
                options={legendOptions}
                legends={legends}
                onLegendChange={onLegendChange}
              />}
          </Col>
        </Row>
        <Row>
          <Col span={5}>
          <MetricsColumn
            metrics={metrics}
            isLoading={isFetchingVisitReport || !hasFetchedVisitReport}
          />
          </Col>
          <Col span={19}>
            {datasource && datasource.length === 0 || !hasFetchedVisitReport
                // TODO INTL
                ? <EmptyCharts title="NO VISIT STAT" />
                : this.renderStackedAreaChart(datasource, optionsForChart)}
          </Col>
        </Row>
      </div>
    );
  }
}
export default VisitAnalysis;
