import * as React from 'react';
import { buildFeedStatsByFeedRequestBody } from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import StackedAreaPlot from '../../../../../../components/Charts/TimeBased/StackedAreaPlot';
import { LoadingChart } from '../../../../../../components/EmptyCharts';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
} from 'react-intl';
import { compose } from 'recompose';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../../Helpers/injectThemeColors';
import McsMoment, { formatMcsDate } from '../../../../../../utils/McsMoment';
import { McsDateRangeValue } from '../../../../../../components/McsDateRangePicker';
import { Card } from 'antd';

interface FeedChartProps {
  organisationId: string;
  feedId: string;
}

type Props = FeedChartProps & InjectedThemeColorsProps & InjectedIntlProps;

interface FeedReport {
  day: string;
  upserted_user_points: number;
  deleted_user_points: number;
}

interface State {
  dataSource: FeedReport[];
  dateRange: McsDateRangeValue;
  isLoading: boolean;
}

class FeedChart extends React.Component<Props, State> {
  @lazyInject(TYPES.IFeedsStatsService)
  private _feedsStatsService: IFeedsStatsService;

  constructor(props: Props) {
    super(props);

    this.state = {
      dataSource: [],
      isLoading: true,
      dateRange: {
        from: new McsMoment('now-7d'),
        to: new McsMoment('now'),
      },
    };
  }

  componentDidMount() {
    this.fetchStats();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { dateRange } = this.state;

    const { dateRange: prevDateRange } = prevState;

    if (dateRange !== prevDateRange) this.fetchStats();
  }

  fetchStats() {
    const { organisationId, feedId } = this.props;
    const { dateRange } = this.state;

    this.setState({
      isLoading: true,
    });

    const formatedInclusiveDateRange = formatMcsDate(dateRange, true);

    const reportBody = buildFeedStatsByFeedRequestBody(feedId, {
      start_date: formatedInclusiveDateRange.from,
      end_date: formatedInclusiveDateRange.to,
    });

    return this._feedsStatsService
      .getStats(organisationId, reportBody)
      .then(res => {
        const normalized = normalizeReportView<{
          day: string;
          sync_type: string;
          uniq_user_points_count: number;
        }>(res.data.report_view);

        const upserts = normalized.filter(rv => rv.sync_type === 'UPSERT');
        const deletes = normalized.filter(rv => rv.sync_type === 'DELETE');

        let feedReports = upserts.map(upsertReport => {
          const deleteReport = deletes.find(r => r.day === upsertReport.day);

          return {
            day: upsertReport.day,
            upserted_user_points: upsertReport.uniq_user_points_count,
            deleted_user_points: deleteReport
              ? deleteReport.uniq_user_points_count
              : 0,
          };
        });

        if (!feedReports.find(fr => fr.day === formatedInclusiveDateRange.from))
          feedReports = [
            {
              day: formatedInclusiveDateRange.from,
              upserted_user_points: 0,
              deleted_user_points: 0,
            },
          ].concat(feedReports);

        const formatedNonInclusiveDateRange = formatMcsDate(dateRange);

        if (
          !feedReports.find(fr => fr.day === formatedNonInclusiveDateRange.to)
        )
          feedReports.push({
            day: formatedNonInclusiveDateRange.to,
            upserted_user_points: 0,
            deleted_user_points: 0,
          });

        return this.setState({
          dataSource: feedReports,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    const { colors, intl } = this.props;
    const { dataSource, isLoading } = this.state;

    const metrics =
      dataSource && dataSource[0]
        ? Object.keys(dataSource[0]).filter(el => el !== 'day')
        : [];

    const optionsForChart = {
      xKey: 'day',
      yKeys: metrics.map(metric => {
        return {
          key: metric,
          message: messagesMap[metric],
        };
      }),
      colors: [colors['mcs-info'], colors['mcs-error']],
    };

    return isLoading ? (
      <LoadingChart />
    ) : (
      <Card
        className="mcs-card-container compact"
        title={intl.formatMessage(messagesMap.graph_title)}
      >
        <StackedAreaPlot
          dataset={dataSource as any}
          options={optionsForChart}
        />
      </Card>
    );
  }
}

export default compose<Props, FeedChartProps>(
  injectThemeColors,
  injectIntl,
)(FeedChart);

const messagesMap: {
  [metric: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  upserted_user_points: {
    id: 'feed.upserted_user_points',
    defaultMessage: 'Upserted User Points',
  },
  deleted_user_points: {
    id: 'feed.deleted_user_points',
    defaultMessage: 'Deleted User Points',
  },
  graph_title: {
    id: 'feed.graph_title',
    defaultMessage: 'Last 7 days',
  },
});
