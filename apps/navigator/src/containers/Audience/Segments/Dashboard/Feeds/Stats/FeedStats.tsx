import * as React from 'react';
import { compose } from 'recompose';
import { AudienceFeedTyped } from '../../../Edit/domain';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { Loading, McsDateRangePicker } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';
import { NormalizedFeedStats } from '../Charts/FeedChart';
import {
  buildFeedStatsByFeedRequestBody,
  FeedStatsUnit,
  getFeedStatsUnit,
} from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import moment from 'moment';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../../IntlMessages';
import McsMoment, { formatMcsDate } from '../../../../../../utils/McsMoment';
import FeedStatsTable from './FeedStatsTable';
import FeedStatsGraph from './FeedStatsGraph';
import { Empty } from 'antd';
import { InjectedFeaturesProps, injectFeatures } from '../../../../../Features';
import { FeedStatsNotAvailable } from '../FeedStatsNotAvailable';

interface FeedStatsProps {
  feed: AudienceFeedTyped;
}

type Props = FeedStatsProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  InjectedFeaturesProps;

export type FeedStatsTimeUnit = 'HOUR' | 'DAY';

export interface FeedStatsInfo {
  feedStatsUnit: FeedStatsUnit;
  timeUnit: FeedStatsTimeUnit;
  dateRange: McsDateRangeValue;
  tableInfo: {
    totalSuccessUpserts: number;
    totalSuccessDeletes: number;
    totalNoEligibleIdentifier: number;
    totalUserPointsHandled: number;
  };
  graphInfo: Array<{
    date: string;
    nbSuccessUpserts: number;
    nbSuccessDeletes: number;
  }>;
  displayNoData: boolean;
}

interface State {
  isLoading: boolean;
  stats?: FeedStatsInfo;
  dateRange: McsDateRangeValue;
}

class FeedStats extends React.Component<Props, State> {
  @lazyInject(TYPES.IFeedsStatsService)
  private _feedsStatsService: IFeedsStatsService;

  constructor(props: Props) {
    super(props);

    this.state = {
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

  componentDidUpdate(previousProps: Props, previousState: State) {
    const { feed } = this.props;
    const { dateRange } = this.state;

    const { feed: previousFeed } = previousProps;
    const { dateRange: previousDateRange } = previousState;

    if (
      feed.id !== previousFeed.id ||
      dateRange.from !== previousDateRange.from ||
      dateRange.to !== previousDateRange.to
    ) {
      this.fetchStats();
    }
  }

  getTimeUnit = (): FeedStatsTimeUnit => {
    const { dateRange } = this.state;

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);

    return formatedNonInclusiveDateRange.from === formatedNonInclusiveDateRange.to ? 'HOUR' : 'DAY';
  };

  makeCallForStats = (
    startMoment: moment.Moment,
    endMoment: moment.Moment,
    timeUnit: FeedStatsTimeUnit,
  ): Promise<NormalizedFeedStats[] | undefined> => {
    const { feed } = this.props;

    const reportBody = buildFeedStatsByFeedRequestBody(
      feed.id,
      {
        start_date: startMoment.format(),
        end_date: endMoment.format(),
      },
      timeUnit,
      ['UNIQ_USER_POINTS_COUNT', 'UNIQ_USER_IDENTIFIERS_COUNT'],
      0,
      // max result is calculated by the number of time points plus one times
      // 10 which is 2 SyncTypes * 5 SyncResults
      (endMoment.diff(startMoment, timeUnit === 'DAY' ? 'days' : 'hours') + 1) * 10,
    );

    return this._feedsStatsService
      .getStats(feed.organisation_id, reportBody)
      .then(res => {
        return normalizeReportView<NormalizedFeedStats>(res.data.report_view);
      })
      .catch(() => {
        return undefined;
      });
  };

  fetchStats = () => {
    const { feed } = this.props;
    const { dateRange } = this.state;
    const feedStatsUnit = getFeedStatsUnit(feed);
    const timeUnit = this.getTimeUnit();

    this.setState({ isLoading: true }, () => {
      this.makeCallForStats(dateRange.from.toMoment(), dateRange.to.toMoment(), timeUnit).then(
        res => {
          if (res === undefined) {
            this.setState({ isLoading: false, stats: undefined });
          } else {
            const displayNoData =
              res.filter(line => {
                return line.sync_result === 'SUCCESS';
              }).length === 0;
            const feedStatsInfo: FeedStatsInfo = res.reduce(
              (acc: FeedStatsInfo, v) => {
                const addedValue =
                  feedStatsUnit === 'USER_POINTS'
                    ? v.uniq_user_points_count
                    : v.uniq_user_identifiers_count;

                const valueForSuccessUpsert =
                  v.sync_type === 'UPSERT' && v.sync_result === 'SUCCESS' ? addedValue : 0;

                const valueForSuccessDelete =
                  v.sync_type === 'DELETE' && v.sync_result === 'SUCCESS' ? addedValue : 0;

                const vDate = timeUnit === 'DAY' ? v.date_yyyy_mm_dd : v.hour;

                const updatedGraphInfo = acc.graphInfo.find(line => {
                  return line.date === vDate;
                })
                  ? acc.graphInfo.map(line => {
                      if (line.date === vDate) {
                        return {
                          ...line,
                          nbSuccessUpserts: line.nbSuccessUpserts + valueForSuccessUpsert,
                          nbSuccessDeletes: line.nbSuccessDeletes + valueForSuccessDelete,
                        };
                      }
                      return line;
                    })
                  : acc.graphInfo.concat([
                      {
                        date: vDate,
                        nbSuccessUpserts: valueForSuccessUpsert,
                        nbSuccessDeletes: valueForSuccessDelete,
                      },
                    ]);

                return {
                  feedStatsUnit: acc.feedStatsUnit,
                  timeUnit: acc.timeUnit,
                  dateRange: acc.dateRange,
                  tableInfo: {
                    totalSuccessUpserts: acc.tableInfo.totalSuccessUpserts + valueForSuccessUpsert,
                    totalSuccessDeletes: acc.tableInfo.totalSuccessDeletes + valueForSuccessDelete,
                    totalNoEligibleIdentifier:
                      acc.tableInfo.totalNoEligibleIdentifier +
                      (v.sync_result === 'NO_ELIGIBLE_IDENTIFIER' ? v.uniq_user_points_count : 0),
                    totalUserPointsHandled:
                      acc.tableInfo.totalUserPointsHandled + v.uniq_user_points_count,
                  },
                  graphInfo: updatedGraphInfo,
                  displayNoData: acc.displayNoData,
                };
              },
              {
                feedStatsUnit: feedStatsUnit,
                timeUnit: timeUnit,
                dateRange: dateRange,
                tableInfo: {
                  totalSuccessUpserts: 0,
                  totalSuccessDeletes: 0,
                  totalNoEligibleIdentifier: 0,
                  totalUserPointsHandled: 0,
                },
                graphInfo: [],
                displayNoData: displayNoData,
              },
            );
            this.setState({ isLoading: false, stats: feedStatsInfo });
          }
        },
      );
    });
  };

  render() {
    const { feed, hasFeature } = this.props;
    const { isLoading, stats } = this.state;

    if (hasFeature(`feed-stats_disable_${feed.group_id}_${feed.artifact_id}`))
      return <FeedStatsNotAvailable />;

    const onChange = (newValues: McsDateRangeValue) =>
      this.setState({
        dateRange: {
          from: newValues.from,
          to: newValues.to,
        },
      });

    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;

    const getTableAndGraph = () => {
      if (isLoading) {
        return <Loading isFullScreen={false} />;
      } else if (stats === undefined || stats.displayNoData) {
        return (
          <div className='mcs-feedStats_graph'>
            <Empty className='mcs-feedStats_graph_empty' image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        );
      } else {
        return (
          <div>
            <FeedStatsTable stats={stats} />
            <FeedStatsGraph stats={stats} />
          </div>
        );
      }
    };

    return (
      <div className='mcs-feedStats'>
        <div className='mcs-feedStats_header'>
          <McsDateRangePicker
            values={this.state.dateRange}
            onChange={onChange}
            messages={mcsdatePickerMsg}
            className='mcs-datePicker_container'
          />
        </div>
        {getTableAndGraph()}
      </div>
    );
  }
}

export default compose<Props, FeedStatsProps>(
  injectIntl,
  injectFeatures,
  injectNotifications,
)(FeedStats);
