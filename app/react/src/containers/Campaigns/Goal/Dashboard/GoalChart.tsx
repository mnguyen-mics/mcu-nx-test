import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { EmptyCharts, LoadingChart } from '../../../../components/EmptyCharts';
import { LegendChartWithModal } from '../../../../components/LegendChart';
import MetricsColumn from '../../../../components/MetricsColumn';

import messages from './messages';

import {
  DATE_SEARCH_SETTINGS,
  updateSearch,
  parseSearch,
  compareSearches,
  isSearchValid,
  buildDefaultSearch,
} from '../../../../utils/LocationSearchHelper';
import {
  formatMetric,
  normalizeReportView,
} from '../../../../utils/MetricHelper';
import McsMoment from '../../../../utils/McsMoment';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../components/McsDateRangePicker';
import ReportService from '../../../../services/ReportService';
import { takeLatest } from '../../../../utils/ApiHelper';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import DoubleStackedAreaPlot from '../../../../components/Charts/TimeBased/DoubleStackedAreaPlot';


interface OverallStats {
  value: string;
  conversions: string;
  price: string;
}

interface Stats extends OverallStats {
  date: string;
}

interface GoalStackedAreaChartState {
  key1: keyof OverallStats;
  key2: keyof OverallStats;
  data: {
    items: Stats[];
    overall: OverallStats[];
    isLoading: boolean;
  };
}

interface RouterProps {
  organisationId: string;
  goalId: string;
}

type JoinedProps = InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps &
  RouteComponentProps<RouterProps>;

type OuterProps = {};

const dailyPerformanceFetch = takeLatest(
  ReportService.getSingleConversionPerformanceReport,
);

const overallPerformanceFetch = takeLatest(
  ReportService.getSingleConversionPerformanceReport,
);

const initialState: GoalStackedAreaChartState = {
  key1: 'value',
  key2: 'conversions',
  data: {
    items: [],
    overall: [],
    isLoading: true,
  },
};

class GoalStackedAreaChart extends React.Component<
  JoinedProps,
  GoalStackedAreaChartState
  > {
  constructor(props: JoinedProps) {
    super(props);

    this.state = initialState;
  }

  componentDidMount() {
    const {
      match: { params: { organisationId, goalId } },
      history: { location: { search } },
    } = this.props;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    this.fetchStats(organisationId, goalId, filter.from, filter.to);
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, goalId } },
      history,
      location: { search },
    } = this.props;

    const {
      match: {
        params: { organisationId: nextOrganisationId, goalId: nextGoalId },
      },
      location: { pathname: nextPathname, search: nextSearch },
    } = nextProps;
    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId ||
      goalId !== nextGoalId
    ) {
      if (!isSearchValid(nextSearch, DATE_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DATE_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, DATE_SEARCH_SETTINGS);
        this.fetchStats(nextOrganisationId, nextGoalId, filter.from, filter.to);
      }
    }
  }

  fetchStats = (
    organisationId: string,
    goalId: string,
    startDate: McsMoment,
    endDate: McsMoment,
  ) => {
    this.setState({ data: { items: [], overall: [], isLoading: true } });

    const dailyPerformance = dailyPerformanceFetch(
      organisationId,
      goalId,
      startDate,
      endDate,
      ['day'],
      ['value', 'price', 'conversions'],
    ).then(res => res.data.report_view);

    const overallPerformance = overallPerformanceFetch(
      organisationId,
      goalId,
      startDate,
      endDate,
      [],
      [this.state.key1, this.state.key2],
    ).then(res => res.data.report_view);

    return Promise.all([dailyPerformance, overallPerformance]).then(res =>
      this.setState({
        data: {
          isLoading: false,
          items: normalizeReportView(res[0]),
          overall: normalizeReportView(res[1]),
        },
      }),
    ).catch(err => {
      this.props.notifyError(err);
      this.setState({ ...initialState, data: { ...initialState.data, isLoading: false } })
    });
  };

  createLegend() {
    const { intl: { formatMessage } } = this.props;
    const legends = [
      {
        key: 'value',
        domain: formatMessage(messages.value),
      },
      {
        key: 'conversions',
        domain: formatMessage(messages.conversions),
      },
      {
        key: 'price',
        domain: formatMessage(messages.price),
      },
    ];

    return legends;
  }

  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const { colors } = this.props;
    const { key1, key2, data: { isLoading, items, overall } } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: messages[key1] },
        { key: key2, message: messages[key2] },
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

    const metrics = [
      {
        name: 'conversions',
        value:
          !isLoading && overall.length
            ? formatMetric(overall[0].conversions, '0,0')
            : undefined,
      },
      {
        name: 'value',
        value:
          !isLoading && overall.length
            ? formatMetric(overall[0].value, '0,0')
            : undefined,
      },
      {
        name: 'price',
        value:
          !isLoading && overall.length
            ? formatMetric(overall[0].price, '0,0[.]00', '', '€')
            : undefined,
      },
    ];

    return !isLoading ? (
      <div style={{ display: 'flex' }}>
        <div style={{ float: 'left' }}>
          <MetricsColumn metrics={metrics} isLoading={isLoading} />
        </div>
        <DoubleStackedAreaPlot
          dataset={items as any}
          options={optionsForChart}
          style={{ flex: '1' }}
        />
      </div>
    ) : (
        <LoadingChart />
      );
  }

  render() {
    const { colors, intl: { formatMessage } } = this.props;
    const { key1, key2, data: { isLoading, items } } = this.state;

    const legendOptions = [
      {
        key: key1,
        domain: formatMessage(messages[key1]),
        color: colors['mcs-warning'],
      },
      {
        key: key2,
        domain: formatMessage(messages[key2]),
        color: colors['mcs-info'],
      },
    ];
    const legends = this.createLegend();
    const onLegendChange = (a: keyof OverallStats, b: keyof OverallStats) => {
      this.setState({ key1: a, key2: b });
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {items.length === 0 && isLoading ? (
              <div />
            ) : (
                <LegendChartWithModal
                  identifier="chartLegend"
                  options={legendOptions}
                  legends={legends}
                  onLegendChange={onLegendChange}
                />
              )}
          </Col>
        </Row>
        {items.length === 0 && !isLoading ? (
          <EmptyCharts title={formatMessage(messages.noStatAvailable)} />
        ) : (
            <Row gutter={20}>
              <Col span={24}>{this.renderStackedAreaCharts()}</Col>
            </Row>
          )}
      </div>
    );

    return chartArea;
  }
}

export default compose<JoinedProps, OuterProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
  injectNotifications,
)(GoalStackedAreaChart);
