import * as React from 'react';
import {
  buildFeedStatsByFeedRequestBody,
  FeedStatsUnit,
  getFeedStatsUnit,
} from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import { defineMessages, FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { getAllDates } from '../../../../../../utils/DateHelper';
import HighchartsReact from 'highcharts-react-official';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts';
import { NormalizedFeedStats } from './FeedChart';
import { IExternalFeedSessionService } from '../../../../../../services/ExternalFeedSessionService';
import { AudienceFeedTyped } from '../../../Edit/domain';
import { ExternalFeedSession } from '../../../../../../models/ExternalFeedSession';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import moment from 'moment';
import { convertMcsDateToMoment } from '../../../../../../utils/McsMoment';
import { renderToString } from 'react-dom/server';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Empty } from 'antd';

interface FeedLineDataValue {
  upserted: number;
  deleted: number;
  y: number;
}

interface FeedLineData {
  date: string;
  value: FeedLineDataValue;
}

interface FeedCumulativeChartProps {
  feed: AudienceFeedTyped;
}

type Props = FeedCumulativeChartProps &
  InjectedThemeColorsProps &
  InjectedIntlProps &
  InjectedNotificationProps;

interface State {
  isLoadingStats: boolean;
  isLoadingFeedSession: boolean;
  lastFeedSession?: ExternalFeedSession;
  chartOptions?: {
    serieOption: Highcharts.SeriesOptionsType[];
    xAxisValues?: string[];
  };
  graphData: FeedLineData[];
  feedStatsUnit: FeedStatsUnit;
  hideGraph: boolean;
}

class FeedCumulativeChart extends React.Component<Props, State> {
  @lazyInject(TYPES.IFeedsStatsService)
  private _feedsStatsService: IFeedsStatsService;

  @lazyInject(TYPES.IExternalFeedSessionService)
  private _externalFeedSessionService: IExternalFeedSessionService;

  constructor(props: Props) {
    super(props);
    const { feed } = props;

    this.state = {
      isLoadingStats: false,
      isLoadingFeedSession: true,
      feedStatsUnit: getFeedStatsUnit(feed),
      graphData: [],
      hideGraph: false,
    };
  }

  componentDidMount() {
    this.fetchLastFeedSession();
  }

  fetchLastFeedSession = () => {
    const { feed, notifyError } = this.props;

    this.setState({ isLoadingFeedSession: true }, () => {
      if (feed.type === 'EXTERNAL_FEED') {
        this._externalFeedSessionService
          .getExternalFeedSessions(feed.audience_segment_id, feed.id, {})
          .then(feedSessionsRes => {
            const sortedFeedSessions = feedSessionsRes.data.sort(
              (a, b) => b.open_date - a.open_date,
            );
            const lastFeedSession =
              sortedFeedSessions.length !== 0 ? sortedFeedSessions[0] : undefined;
            this.setState({ lastFeedSession: lastFeedSession, isLoadingFeedSession: false }, () => {
              this.fetchStats();
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({
              lastFeedSession: undefined,
              isLoadingFeedSession: false,
              hideGraph: true,
            });
          });
      } else
        this.setState({
          lastFeedSession: undefined,
          isLoadingFeedSession: false,
          hideGraph: true,
        });
    });
  };

  makeCallForStats = (
    startMoment: moment.Moment,
    endMoment: moment.Moment,
    timeUnit: 'HOUR' | 'DAY',
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
    const { lastFeedSession, feedStatsUnit } = this.state;

    this.setState({ isLoadingStats: true }, () => {
      if (lastFeedSession) {
        const lastFeedSessionMoment = convertMcsDateToMoment(lastFeedSession.open_date);
        const now = moment();
        const yesterday = moment().subtract(1, 'days');
        const aMonthAgo = moment().subtract(30, 'days');

        if (lastFeedSessionMoment.isBefore(aMonthAgo)) {
          // We need to make two calls

          Promise.all([
            this.makeCallForStats(lastFeedSessionMoment, aMonthAgo, 'DAY'),
            this.makeCallForStats(aMonthAgo, now, 'DAY'),
          ]).then(([statsBeforeThirtyDays, lastThirtyDaysStats]) => {
            if (!statsBeforeThirtyDays || !lastThirtyDaysStats) {
              this.setState({ isLoadingStats: false, hideGraph: true });
            } else {
              const initialValue = statsBeforeThirtyDays.reduce(
                (acc: FeedLineDataValue, v) => {
                  const nb =
                    feedStatsUnit === 'USER_IDENTIFIERS'
                      ? v.uniq_user_identifiers_count
                      : v.uniq_user_points_count;
                  if (
                    v.sync_type === 'UPSERT' &&
                    (v.sync_result === 'PROCESSED' || v.sync_result === 'SUCCESS')
                  )
                    return {
                      upserted: acc.upserted + nb,
                      deleted: acc.deleted,
                      y: acc.y + nb,
                    };
                  else if (
                    v.sync_type === 'DELETE' &&
                    (v.sync_result === 'PROCESSED' || v.sync_result === 'SUCCESS')
                  )
                    return {
                      upserted: acc.upserted,
                      deleted: acc.deleted + nb,
                      y: acc.y - nb,
                    };
                  else return acc;
                },
                {
                  upserted: 0,
                  deleted: 0,
                  y: 0,
                },
              );
              const graphData = this.computeLineSeries(
                lastThirtyDaysStats,
                initialValue,
                aMonthAgo,
                now,
                'DAY',
              );
              this.setState({ graphData, isLoadingStats: false });
            }
          });
        } else {
          // One call is needed, with a time unit that depends on the last feed session open date
          const timeUnit = lastFeedSessionMoment.isBefore(yesterday) ? 'DAY' : 'HOUR';
          this.makeCallForStats(lastFeedSessionMoment, now, timeUnit).then(res => {
            if (!res) {
              this.setState({ isLoadingStats: false, hideGraph: true });
            } else {
              const graphData = this.computeLineSeries(
                res,
                {
                  upserted: 0,
                  deleted: 0,
                  y: 0,
                },
                timeUnit === 'DAY' ? lastFeedSessionMoment : yesterday.startOf('hour'),
                timeUnit === 'DAY' ? now : now.startOf('hour'),
                timeUnit,
              );
              this.setState({ graphData, isLoadingStats: false });
            }
          });
        }
      } else this.setState({ isLoadingStats: false, hideGraph: true });
    });
  };

  computeLineSeries(
    normalizedFeedStats: NormalizedFeedStats[],
    initialValue: FeedLineDataValue,
    from: moment.Moment,
    to: moment.Moment,
    timeUnit: 'DAY' | 'HOUR',
  ): FeedLineData[] {
    // This function computes the values of the data points of the graph given normalized stats
    // and an initial value for the first point of the graph.
    const { feedStatsUnit } = this.state;

    const allDates = getAllDates(timeUnit, { from: from.format(), to: to.format() });

    // First, the increments for each point of the graph are computed.
    const incrementsData = normalizedFeedStats.reduce(
      (acc: FeedLineData[], data): FeedLineData[] => {
        const date = timeUnit === 'HOUR' ? data.hour : data.date_yyyy_mm_dd;
        const nb =
          feedStatsUnit === 'USER_POINTS'
            ? data.uniq_user_points_count
            : data.uniq_user_identifiers_count;
        const foundInAcc = acc.find(val => {
          return date === val.date;
        });
        const getValueForNewLine = () => {
          if (
            data.sync_type === 'UPSERT' &&
            (data.sync_result === 'PROCESSED' || data.sync_result === 'SUCCESS')
          )
            return {
              upserted: nb,
              deleted: 0,
              y: nb,
            };
          else if (
            data.sync_type === 'DELETE' &&
            (data.sync_result === 'PROCESSED' || data.sync_result === 'SUCCESS')
          )
            return {
              upserted: 0,
              deleted: nb,
              y: -nb,
            };
          else return undefined;
        };
        const valueForNewLine = getValueForNewLine();
        const listToConcatForNewLine = valueForNewLine
          ? [
              {
                date: date,
                value: valueForNewLine,
              },
            ]
          : [];
        const newAcc = foundInAcc
          ? acc.map(val => {
              if (date === val.date) {
                if (
                  data.sync_type === 'UPSERT' &&
                  (data.sync_result === 'PROCESSED' || data.sync_result === 'SUCCESS')
                ) {
                  return {
                    ...val,
                    value: {
                      upserted: val.value.upserted + nb,
                      deleted: val.value.deleted,
                      y: val.value.y + nb,
                    },
                  };
                } else if (
                  data.sync_type === 'DELETE' &&
                  (data.sync_result === 'PROCESSED' || data.sync_result === 'SUCCESS')
                ) {
                  return {
                    ...val,
                    value: {
                      upserted: val.value.upserted,
                      deleted: val.value.deleted + nb,
                      y: val.value.y - nb,
                    },
                  };
                }
                return val;
              } else return val;
            })
          : acc.concat(listToConcatForNewLine);
        return newAcc;
      },
      [],
    );

    // Then, given the increments, the cumulative value for each point of the
    // graph is computed.
    const reducedData = allDates.reduce(
      (acc: { data: FeedLineData[]; previousValue: FeedLineData }, d) => {
        const incrementValueForD = incrementsData.find(val => {
          return val.date === d;
        })?.value || { upserted: 0, deleted: 0, y: 0 };

        const previousValue = acc.previousValue.value;

        const computedValue: FeedLineData = {
          date: d,
          value: {
            upserted: previousValue.upserted + incrementValueForD.upserted,
            deleted: previousValue.deleted + incrementValueForD.deleted,
            y: previousValue.y + incrementValueForD.y,
          },
        };

        return {
          data: acc.data.concat([computedValue]),
          previousValue: computedValue,
        };
      },
      {
        data: [],
        previousValue: { date: 'fakeDateForInitialization', value: initialValue },
      },
    ).data;

    return reducedData;
  }

  getChartOptions = (): {
    serieOption: Highcharts.SeriesOptionsType[];
    xAxisValues: string[];
  } => {
    const {
      intl: { formatMessage },
    } = this.props;
    const { graphData, feedStatsUnit } = this.state;

    if (!graphData) return { serieOption: [], xAxisValues: [] };

    return {
      serieOption: [
        {
          name: formatMessage(
            feedStatsUnit === 'USER_IDENTIFIERS'
              ? messages.identifiersLineChartSerieName
              : messages.userPointsLineChartSerieName,
          ),
          data: graphData.map(d => d.value),
          color: '#00A1DF',
        } as Highcharts.SeriesOptionsType,
      ],
      xAxisValues: graphData.map(d => d.date),
    };
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { isLoadingFeedSession, isLoadingStats, feedStatsUnit, hideGraph } = this.state;

    const chartOptions = this.getChartOptions();

    const tooltipFormatter = (tooltipFormatterContextObject: TooltipFormatterContextObject) => {
      const foundPoint = tooltipFormatterContextObject.points?.find(p => {
        return p.x === tooltipFormatterContextObject.x;
      })?.point;
      const upserted = foundPoint
        ? (Object.entries(foundPoint).find(v => v[0] === 'upserted')?.[1] as number)
        : undefined;
      const deleted = foundPoint
        ? (Object.entries(foundPoint).find(v => v[0] === 'deleted')?.[1] as number)
        : undefined;
      const y = foundPoint?.y;
      return renderToString(
        <div className='mcs-feedLineChart_tooltip'>
          <div className='mcs-feedLineChart_tooltip_delta'>
            {`${y ? y.toLocaleString('en') : '-'} ${
              feedStatsUnit === 'USER_IDENTIFIERS'
                ? formatMessage(messages.identifier)
                : formatMessage(messages.userPoint)
            }${upserted === 1 ? '' : 's'} ${formatMessage(messages.sent)}`}
          </div>
          <div className='mcs-feedLineChart_tooltip_upsert'>
            <ArrowUpOutlined className='mcs-feedLineChart_tooltip_upsert_logo' />
            {`${upserted ? upserted.toLocaleString('en') : '-'} ${formatMessage(messages.upsert)} ${
              feedStatsUnit === 'USER_IDENTIFIERS'
                ? formatMessage(messages.identifier)
                : formatMessage(messages.userPoint)
            }${upserted === 1 ? '' : 's'}`}
          </div>
          <div className='mcs-feedLineChart_tooltip_delete'>
            <ArrowDownOutlined className='mcs-feedLineChart_tooltip_delete_logo' />
            {`${deleted ? deleted.toLocaleString('en') : '-'} ${formatMessage(messages.delete)} ${
              feedStatsUnit === 'USER_IDENTIFIERS'
                ? formatMessage(messages.identifier)
                : formatMessage(messages.userPoint)
            }${deleted === 1 ? '' : 's'}`}
          </div>
        </div>,
      );
    };

    const lineChartOptions: Highcharts.Options = {
      chart: {
        type: 'line',
      },
      title: { text: '' },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        padding: 15,
        outside: false,
        shadow: false,
        hideDelay: 0,
        formatter() {
          return tooltipFormatter(this);
        },
      },
      xAxis: {
        categories: chartOptions.xAxisValues,
        crosshair: true,
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          formatter: function () {
            return Math.abs(this.value) + '';
          },
        },
      },
    };

    const chart =
      isLoadingFeedSession || isLoadingStats ? (
        <LoadingChart />
      ) : hideGraph ? (
        <div className='mcs-feedChart_noStats'>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                {formatMessage(messages.noStats)}
                <br />
                {formatMessage(messages.noStatsUpdate)}
              </div>
            }
          />
        </div>
      ) : (
        <HighchartsReact
          highcharts={Highcharts}
          options={{ ...lineChartOptions, series: chartOptions.serieOption }}
        />
      );

    return (
      <div className='mcs-feedChart'>
        <div className='mcs-feedChart_chart'>
          <div className='mcs-feedChart_chart_title'>
            {formatMessage(
              feedStatsUnit === 'USER_IDENTIFIERS'
                ? messages.identifiersLineChartTitle
                : messages.userPointsLineChartTitle,
            )}
          </div>
          <div className='mcs-feedChart_chart_subTitle'>
            {formatMessage(
              feedStatsUnit === 'USER_IDENTIFIERS'
                ? messages.identifiersLineChartSubTitle
                : messages.userPointsLineChartSubTitle,
            )}
          </div>
          {chart}
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedCumulativeChartProps>(
  injectThemeColors,
  injectIntl,
  injectNotifications,
)(FeedCumulativeChart);

const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  identifiersLineChartTitle: {
    id: 'feed.lineChart.identifiers.title',
    defaultMessage: 'Cumulative amount of identifiers sent',
  },
  userPointsLineChartTitle: {
    id: 'feed.lineChart.userPoints.title',
    defaultMessage: 'Cumulative amount of user points sent',
  },
  identifiersLineChartSubTitle: {
    id: 'feed.lineChart.identifiers.subtitle',
    defaultMessage:
      'This represents the number of identifiers you should have in the destination if the drop rate with us is 0. Calculated with the total number of identifiers sent minus the total number of identifiers removed since last feed’s restart.',
  },
  userPointsLineChartSubTitle: {
    id: 'feed.lineChart.userPoints.subtitle',
    defaultMessage:
      'This represents the number of user points you should have in the destination if the drop rate with us is 0. Calculated with the total number of user points sent minus the total number of user points removed since last feed’s restart.',
  },
  identifiersLineChartSerieName: {
    id: 'feed.lineChart.identifiers.serie.name',
    defaultMessage: 'Identifiers sent',
  },
  userPointsLineChartSerieName: {
    id: 'feed.lineChart.userPoints.serie.name',
    defaultMessage: 'User points sent',
  },
  userPoint: {
    id: 'feed.lineChart.userPoint',
    defaultMessage: 'user point',
  },
  identifier: {
    id: 'feed.lineChart.identifier',
    defaultMessage: 'identifier',
  },
  upsert: {
    id: 'feed.lineChart.upsert',
    defaultMessage: 'upsert',
  },
  delete: {
    id: 'feed.lineChart.delete',
    defaultMessage: 'delete',
  },
  sent: {
    id: 'feed.lineChart.sent',
    defaultMessage: 'sent to the destination segment',
  },
  noStats: {
    id: 'feed.lineChart.noStats',
    defaultMessage: 'No stats are available.',
  },
  noStatsUpdate: {
    id: 'feed.lineChart.noStats.update',
    defaultMessage: 'The feed plugin may require an update to display stats.',
  },
});
