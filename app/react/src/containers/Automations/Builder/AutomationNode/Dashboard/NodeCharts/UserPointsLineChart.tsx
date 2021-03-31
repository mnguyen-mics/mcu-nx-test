import {
  Loading,
  StackedAreaPlot,
  Card,
} from '@mediarithmics-private/mcs-components-library';
import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import {
  ReportView,
  ReportViewResource,
} from '../../../../../../models/ReportView';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import { Index } from '../../../../../../utils';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../../Helpers/injectThemeColors';
import { AnalyticsEntity } from '../ScenarioAnalyticsGenericDashboard/ScenarioAnalyticsGenericDashboard';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';

const messages = defineMessages({
  users: {
    id: 'automationDashboardPage.analyticsDrawer.usersLine',
    defaultMessage: 'Users',
  },
});

export interface UserPointsLineChartProps {
  graphTitle: string;
  analyticsEntity: AnalyticsEntity;
  dateRange?: McsDateRangeValue;
}

type Props = UserPointsLineChartProps &
  InjectedIntlProps &
  InjectedThemeColorsProps;

type State = {
  isLoading: boolean;
  data: Array<Index<any>>;
};

class UserPointsLineChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      data: [],
    };
  }

  componentDidMount() {
    this.fetchAndComputeData();
  }

  componentDidUpdate(previousProps: Props) {
    const {
      analyticsEntity: previousAnalyticsEntity,
      dateRange: previousDateRange,
    } = previousProps;
    const { analyticsEntity, dateRange } = this.props;

    if (
      analyticsEntity !== previousAnalyticsEntity ||
      dateRange !== previousDateRange
    )
      this.fetchAndComputeData();
  }

  mockScenarioAnalyticsGetAnalytics = (
    analyticsEntity: AnalyticsEntity,
    dateRange: McsDateRangeValue,
  ) => {
    const reportView: ReportView = {
      items_per_page: 12,
      total_items: 48,
      columns_headers: [
        'day',
        analyticsEntity.analyticsEntityType === 'NODE'
          ? 'node_id'
          : 'exit_condition_id',
        'user_point_count',
      ],
      rows: [
        ['2021-03-15', analyticsEntity.entityId, '1'],
        ['2021-03-16', analyticsEntity.entityId, '4'],
        ['2021-03-17', analyticsEntity.entityId, '9'],
        ['2021-03-18', analyticsEntity.entityId, '16'],
        ['2021-03-19', analyticsEntity.entityId, '25'],
      ],
    };

    return {
      report_view: reportView,
    };
  };

  fetchAndComputeData = () => {
    const { analyticsEntity, dateRange } = this.props;
    if (dateRange) {
      this.setState({ isLoading: true }, () => {
        const reportViewResource: ReportViewResource = this.mockScenarioAnalyticsGetAnalytics(
          analyticsEntity,
          dateRange,
        );

        const data = normalizeReportView(reportViewResource.report_view);

        this.setState({ isLoading: false, data: data });
      });
    }
  };

  renderStackedAreaChart = () => {
    const {
      colors,
      intl: { formatMessage },
    } = this.props;
    const { data } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'user_point_count', message: formatMessage(messages.users) },
      ],
      colors: [colors['mcs-warning']],
    };

    return <StackedAreaPlot dataset={data} options={optionsForChart} />;
  };

  render() {
    const { graphTitle, dateRange } = this.props;
    const { isLoading } = this.state;

    const cardContent =
      isLoading || !dateRange ? (
        <Loading isFullScreen={true} />
      ) : (
        this.renderStackedAreaChart()
      );

    return <Card title={graphTitle}>{cardContent}</Card>;
  }
}

export default compose<Props, UserPointsLineChartProps>(
  injectIntl,
  injectThemeColors,
)(UserPointsLineChart);
