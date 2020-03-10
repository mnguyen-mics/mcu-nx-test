import * as React from 'react';
import { buildFeedStatsByFeedRequestBody } from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
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
import StackedBarPlot from '../../../../../../components/Charts/CategoryBased/StackedBarPlot';
import moment from 'moment';

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
        from: new McsMoment('now-6d'),
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

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);
    const allDates = [formatedNonInclusiveDateRange.from];

    while(allDates[allDates.length - 1] !== moment(formatedNonInclusiveDateRange.to).format('YYYY-MM-DD')) {
      allDates.push(moment(allDates[allDates.length - 1]).add(1, 'days').format('YYYY-MM-DD'));
    }

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

        allDates.map(date => {
          if(!feedReports.find(report => report.day === date)) {
            feedReports.push({
              day: date,
              upserted_user_points: 0,
              deleted_user_points: 0,
            });
          }
        });

        feedReports = feedReports.sort((report1, report2) => report1.day.localeCompare(report2.day));

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

  renderDescription() {
    return (
        <div className="description">
          <img className="beta-logo" src="/react/src/assets/images/beta-icon.png" />
          <div>
            <FormattedMessage {...messagesMap.stats_description1} />
          </div>
          <br/>
          <div>
            <FormattedMessage {...messagesMap.stats_description2} />
          </div>
        </div>
    );
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
      showLegend: true
    };

    return (
      <div className="mcs-feed-chart">
        {this.renderDescription()}
        {isLoading ? (
          <LoadingChart />
        ) : (
          <Card
            className="mcs-card-container compact"
            title={intl.formatMessage(messagesMap.graph_title)}
          >
            <StackedBarPlot
              dataset={dataSource as any}
              options={optionsForChart}
            />
          </Card>
        )}
      </div>
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
  stats_description1: {
    id: 'audience.feeds.stats.description1',
    defaultMessage:
      'The chart below displays the segment loads sent to the external platform, \
    day by day: whenever a user is entering / leaving the segment, \
    this feed is keeping in sync the destination segment.',
  },
  stats_description2: {
    id: 'audience.feeds.stats.description2',
    defaultMessage:
      'When the feed is created, the platform is streaming all the users that \
    entered the segment prior to the feed creation to be sure that the full segment is \
    shared with the external platform. Hence, it is normal to see a spike in the user \
    additions load at the creation of the feed and afterwards a decrease in the segment loads size.',
  },
});
