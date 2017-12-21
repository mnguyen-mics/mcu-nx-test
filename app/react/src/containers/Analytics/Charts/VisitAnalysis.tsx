import * as React from 'react';

import { EmptyCharts } from '../../../components/EmptyCharts/index';
import MetricsColumn from '../../../components/MetricsColumn';
import { formatMetric } from '../../../utils/MetricHelper';
import { LegendChartWithModal } from '../../../components/LegendChart';
import messages from '../Overview/messages';
import StackedAreaPlotDoubleAxis from '../../../components/StackedAreaPlot/StackedAreaPlotDoubleAxis';
import Col from 'antd/lib/grid/col';
import Row from 'antd/lib/grid/row';
import {compose} from 'recompose';
import {injectIntl, InjectedIntlProps} from 'react-intl';
import MessageDescriptor = ReactIntl.FormattedMessage.MessageDescriptor;
import McsMoment from '../../../utils/McsMoment';
import {updateSearch} from '../../../utils/LocationSearchHelper';
import {withRouter} from 'react-router-dom';
import {ANALYTICS_DASHBOARD_SEARCH_SETTINGS} from '../constants';
import {McsDateRangeValue} from '../../../components/McsDateRangePicker';
import {RouteComponentProps} from 'react-router';
import {connect} from 'react-redux';

const _messages: {[s: string]: MessageDescriptor} = messages;

interface VisitAnalysisProps {
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  colors: { [s: string]: string };
}
type JoinedProps = VisitAnalysisProps & InjectedIntlProps & RouteComponentProps<any>;

interface VisitAnalysisState {
  key1: string;
  key2: string;
}

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
        intlMessages={_messages}
      />
    );
  }

  createLegend() {
    const { intl: { formatMessage } } = this.props;
    const keys = ['max_duration', 'min_duration', 'unique_user', 'count', 'unique_visitor'];
    return keys.map(key => {
      return {
        key: key,
        domain: formatMessage(_messages[key]),
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

  updateLocationSearch(params: McsDateRangeValue) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, ANALYTICS_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      intl: {
        formatMessage
      },
      report,
      hasFetchedVisitReport,
      isFetchingVisitReport,
      colors
    } = this.props;
    const { key1, key2 } = this.state;

    const metrics = [{
      name: formatMessage(messages.users),
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: formatMessage(messages.sessions),
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: formatMessage(messages.bounce_rate),
      value: hasFetchedVisitReport ? formatMetric(this.extractUsers(report), '0') : undefined,
    }, {
      name: formatMessage(messages.session_duration),
      value: hasFetchedVisitReport ? formatMetric(this.extractSessionDuration(report), '0') : undefined,
    }];

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: formatMessage(_messages[key1]) },
        { key: key2, message: formatMessage(_messages[key2]) },
      ],
      colors: [colors['mcs-warning'], colors['mcs-info']],
      isDraggable: true,
      onDragEnd: (values: string[]) => {
        this.updateLocationSearch({
          from: new McsMoment(values[0]),
          to: new McsMoment(values[1]),
        });
      },
    };

    const legendOptions = [
      {
        key: key1,
        domain: formatMessage(_messages[key1]),
        color: colors['mcs-warning'],
      },
      {
        key: key2,
        domain: formatMessage(_messages[key2]),
        color: colors['mcs-info'],
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
                ? <EmptyCharts title={formatMessage(messages.no_visit_stat)} />
                : this.renderStackedAreaChart(datasource, optionsForChart)}
          </Col>
        </Row>
      </div>
    );
  }
}
export default compose<JoinedProps, any>(
  withRouter,
  injectIntl,
  connect(
    (state: any) => ({
      colors: state.theme.colors,
    }),
  ),
)(VisitAnalysis);
