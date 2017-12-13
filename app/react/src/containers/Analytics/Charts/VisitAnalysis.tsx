import * as React from 'react';
import {InjectedIntlProps} from "react-intl";
import {RouteComponentProps} from 'react-router';
import { withRouter } from 'react-router-dom';

import { EmptyCharts } from '../../../components/EmptyCharts/index';
import MetricsColumn from '../../../components/MetricsColumn';
import { formatMetric } from '../../../utils/MetricHelper';
import { LegendChartWithModal } from '../../../components/LegendChart';
import messages from '../Dashboard/messages';
import StackedAreaPlotDoubleAxis from '../../../components/StackedAreaPlot/StackedAreaPlotDoubleAxis';
import Col from 'antd/lib/grid/col';
import Row from 'antd/lib/grid/row';
import {parseSearch, updateSearch} from '../../../utils/LocationSearchHelper';
import { ANALYTICS_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import McsDateRangePicker, {McsDateRangeValue} from '../../../components/McsDateRangePicker';
import {compose} from "recompose";

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
}

interface VisitAnalysisProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
}
type JoinedProps = VisitAnalysisProps & RouteComponentProps<RouterMatchParams> & InjectedIntlProps;

interface VisitAnalysisState {
  key1: string;
  key2: string;
  hasFetchedOverallStat?: boolean;
  isFetchingOverallStat?: boolean;
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

  updateLocationSearch(params: McsDateRangeValue) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, ANALYTICS_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, ANALYTICS_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        rangeType: newValues.rangeType,
        lookbackWindow: newValues.lookbackWindow,
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  extractUsers(report: any[]) {
    return report.reduce((accu: number, row: any) => { return accu + row.count; }, 0);
  }

  extractSessionDuration(report: any[]) {
    return report.reduce((accu: number, row: any) => { return accu + row.min_duration; }, 0);
  }

  render() {
    const { report, history: { location: { search } } } = this.props;
    const hasFetchedOverallStat = true;
    const isFetchingOverallStat = false;
    const overallStat = {
      users: this.extractUsers(report),
      sessions: this.extractUsers(report),
      bounce_rate: this.extractUsers(report),
      session_duration: this.extractSessionDuration(report),
    };

    const filter = parseSearch(search, ANALYTICS_DASHBOARD_SEARCH_SETTINGS);

    const { key1, key2 } = this.state;

    const metrics = [{
      name: 'Users',
      value: hasFetchedOverallStat ? formatMetric(overallStat.users, '0') : undefined,
    }, {
      name: 'Sessions',
      value: hasFetchedOverallStat ? formatMetric(overallStat.sessions, '0') : undefined,
    }, {
      name: 'Bounce Rate',
      value: hasFetchedOverallStat ? formatMetric(overallStat.bounce_rate, '0') : undefined,
    }, {
      name: 'Session Duration',
      value: hasFetchedOverallStat ? formatMetric(overallStat.session_duration, '0') : undefined,
    }];

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: _messages[key1] },
        { key: key2, message: _messages[key2] },
      ],
      lookbackWindow: filter.lookbackWindow,
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

    const onLegendChange = (a: string, b: string) => this.setState({ key1: a, key2: b });
    const datasource = report;
    return (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {datasource.length === 0 && (hasFetchedOverallStat)
              ? <div />
              : <LegendChartWithModal
                  identifier="chartLegend"
                  options={legendOptions}
                  legends={legends}
                  onLegendChange={onLegendChange}
                />}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              {this.renderDatePicker()}
            </span>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <MetricsColumn
              metrics={metrics}
              isLoading={isFetchingOverallStat || !hasFetchedOverallStat}
            />
          </Col>
          <Col span={19}>
            {datasource.length === 0 || !this.props.hasFetchedVisitReport
                // TODO INTL
                ? <EmptyCharts title="NO VISIT STAT" />
                : this.renderStackedAreaChart(datasource, optionsForChart)}
          </Col>
        </Row>
      </div>
    );
  }
}
export default compose(
  withRouter,
)
(VisitAnalysis);
