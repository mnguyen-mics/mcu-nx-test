import * as React from 'react';
import {
  buildFeedStatsByFeedRequestBody,
  FeedStatsUnit,
  SyncResult,
  SyncType,
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
import { formatMcsDate } from '../../../../../../utils/McsMoment';
import { LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { getAllDates } from '../../../../../../utils/DateHelper';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

interface FeedChartProps {
  title?: React.ReactNode;
  feedId: string;
  organisationId: string;
  dateRange: McsDateRangeValue;
}

type Props = FeedChartProps & InjectedThemeColorsProps & InjectedIntlProps;

export interface NormalizedFeedStats {
  hour: string;
  date_yyyy_mm_dd: string;
  sync_type: SyncType;
  sync_result: SyncResult;
  uniq_user_points_count: number;
  uniq_user_identifiers_count: number;
}

interface State {
  normalizedFeedStats?: NormalizedFeedStats[];
  isLoading: boolean;
}

const COLORS: {
  [key in SyncType]: { [key in SyncResult]: string };
} = {
  UPSERT: {
    SUCCESS: '#00AB67',
    PROCESSED: '#00A1DF',
    FAILURE: '#FC3F48',
    NO_ELIGIBLE_IDENTIFIER: '#513FAB',
    REJECTED: '#FD7C12',
  },
  DELETE: {
    SUCCESS: '#D3EBDD',
    PROCESSED: '#CCE8FF',
    FAILURE: '#FFBAB5',
    NO_ELIGIBLE_IDENTIFIER: '#BEAEEB',
    REJECTED: '#FFCB8C',
  },
};

class FeedChart extends React.Component<Props, State> {
  @lazyInject(TYPES.IFeedsStatsService)
  private _feedsStatsService: IFeedsStatsService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.fetchStats();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { dateRange } = this.props;

    const { dateRange: prevDateRange } = prevProps;

    if (dateRange !== prevDateRange) this.fetchStats();
  }

  getTimeUnit(): 'HOUR' | 'DAY' {
    const { dateRange } = this.props;

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);

    return formatedNonInclusiveDateRange.from === formatedNonInclusiveDateRange.to ? 'HOUR' : 'DAY';
  }

  fetchStats() {
    const { organisationId, feedId, dateRange } = this.props;

    this.setState({
      isLoading: true,
    });

    const formatedInclusiveDateRange = formatMcsDate(dateRange, true);

    const reportBody = buildFeedStatsByFeedRequestBody(
      feedId,
      {
        start_date: formatedInclusiveDateRange.from,
        end_date: formatedInclusiveDateRange.to,
      },
      this.getTimeUnit(),
      ['UNIQ_USER_POINTS_COUNT', 'UNIQ_USER_IDENTIFIERS_COUNT'],
      0,
      250,
    );

    return this._feedsStatsService
      .getStats(organisationId, reportBody)
      .then(res => {
        this.setState({
          normalizedFeedStats: normalizeReportView<NormalizedFeedStats>(res.data.report_view),
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  getSeries(feedStatsUnit: FeedStatsUnit): Highcharts.SeriesOptionsType[] {
    const { normalizedFeedStats } = this.state;
    const {
      dateRange,
      intl: { formatMessage },
    } = this.props;

    if (!normalizedFeedStats) return [];

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);
    const timeUnit = this.getTimeUnit();
    const allDates = getAllDates(timeUnit, formatedNonInclusiveDateRange);

    const seriesData: {
      [key in SyncType]: { [key in SyncResult]?: Array<number | null> };
    } =
      feedStatsUnit === 'USER_IDENTIFIERS'
        ? {
            UPSERT: {
              SUCCESS: [],
              PROCESSED: [],
              FAILURE: [],
            },
            DELETE: {
              SUCCESS: [],
              PROCESSED: [],
              FAILURE: [],
            },
          }
        : {
            UPSERT: {
              SUCCESS: [],
              PROCESSED: [],
              NO_ELIGIBLE_IDENTIFIER: [],
              REJECTED: [],
              FAILURE: [],
            },
            DELETE: {
              SUCCESS: [],
              PROCESSED: [],
              NO_ELIGIBLE_IDENTIFIER: [],
              REJECTED: [],
              FAILURE: [],
            },
          };

    Object.keys(seriesData).map((syncType: SyncType) =>
      Object.keys(seriesData[syncType]).map((syncResult: SyncResult) => {
        const filtered = normalizedFeedStats.filter(
          n => n.sync_type === syncType && n.sync_result === syncResult,
        );
        seriesData[syncType][syncResult] = allDates.map(day => {
          const upsertedOnDay = filtered.find(
            r => (timeUnit === 'HOUR' ? r.hour : r.date_yyyy_mm_dd) === day,
          );
          const count =
            feedStatsUnit === 'USER_IDENTIFIERS'
              ? upsertedOnDay?.uniq_user_identifiers_count
              : upsertedOnDay?.uniq_user_points_count;

          if (!count) return null;
          return syncType === 'DELETE' ? -count : count;
        });
      }),
    );

    return Object.keys(seriesData).flatMap((syncType: SyncType) =>
      Object.keys(seriesData[syncType]).map((syncResult: SyncResult) => {
        const data = seriesData[syncType][syncResult];
        let name = formatMessage(messages[syncType]) + ' ' + formatMessage(messages[syncResult]);

        if (syncResult === 'NO_ELIGIBLE_IDENTIFIER') {
          name = formatMessage(
            syncType === 'UPSERT' ? messages.noEligibleUpsert : messages.noEligibleDelete,
          );
        }

        return {
          name: name,
          data: data,
          stack: syncType,
          color: COLORS[syncType][syncResult],
          showInLegend: data ? data.findIndex(v => v != null) >= 0 : false,
        } as Highcharts.SeriesOptionsType;
      }),
    );
  }

  render() {
    const {
      title,
      dateRange,
      intl: { formatMessage },
    } = this.props;
    const { isLoading } = this.state;

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);
    const timeUnit = this.getTimeUnit();

    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column',
      },
      title: { text: '' },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
      },
      tooltip: {
        shared: true,
        useHTML: false,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        padding: 15,
        outside: false,
        shadow: false,
        hideDelay: 0,
        formatter() {
          const header = `<span style="font-size: 12px; font-weight: bold; margin-bottom: 13px;">${this.x}</span><br/><br/>`;
          const points = !this.points
            ? []
            : this.points?.map(point => {
                return `<span style="color:${
                  point.color
                }; font-size: 20px; margin-right: 20px;">\u25CF</span> ${
                  point.series.name
                }: <b>${Math.abs(point.y)}</b><br/>`;
              });

          return header.concat(...points);
        },
      },
      xAxis: {
        categories: getAllDates(timeUnit, formatedNonInclusiveDateRange),
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

    return (
      <div className='mcs-feedChart'>
        <div className='mcs-feedChart_header'>{title}</div>
        <div className='mcs-feedChart_chart'>
          <div className='mcs-feedChart_chart_title'>
            {formatMessage(messages.chartIdentifierTitle)}
          </div>
          <div className='mcs-feedChart_chart_subTitle'>
            {formatMessage(messages.chartIdentifierSubTitle)}
          </div>
          {isLoading ? (
            <LoadingChart />
          ) : (
            <HighchartsReact
              highcharts={Highcharts}
              options={{ ...chartOptions, series: this.getSeries('USER_IDENTIFIERS') }}
            />
          )}
        </div>
        <div className='mcs-feedChart_chart'>
          <div className='mcs-feedChart_chart_title'>
            {formatMessage(messages.chartUserPointTitle)}
          </div>
          <div className='mcs-feedChart_chart_subTitle'>
            {formatMessage(messages.chartUserPointSubTitle)}
          </div>
          {isLoading ? (
            <LoadingChart />
          ) : (
            <HighchartsReact
              highcharts={Highcharts}
              options={{ ...chartOptions, series: this.getSeries('USER_POINTS') }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default compose<Props, FeedChartProps>(injectThemeColors, injectIntl)(FeedChart);

const messages: {
  [metric: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  chartIdentifierTitle: {
    id: 'feed.chartIdentifier.title',
    defaultMessage: 'Identifiers handled by the feed',
  },
  chartIdentifierSubTitle: {
    id: 'feed.chartIdentifier.subTitle',
    defaultMessage: 'Number of identifiers the feed tried to send, with result.',
  },
  chartUserPointTitle: {
    id: 'feed.chartUserPoint.title',
    defaultMessage: 'User points handled by the feed',
  },
  chartUserPointSubTitle: {
    id: 'feed.chartUserPoint.subTitle',
    defaultMessage: 'Number of user point updates the feed tried to send, with result.',
  },
  UPSERT: {
    id: 'feed.upsert',
    defaultMessage: 'Push',
  },
  DELETE: {
    id: 'feed.delete',
    defaultMessage: 'Remove',
  },
  SUCCESS: {
    id: 'feed.success',
    defaultMessage: 'validated',
  },
  PROCESSED: {
    id: 'feed.processed',
    defaultMessage: 'processed',
  },
  NO_ELIGIBLE_IDENTIFIER: {
    id: 'feed.noEligibleIdentifier',
    defaultMessage: 'no eligible identifier',
  },
  noEligibleUpsert: {
    id: 'feed.noEligibleIdentifier.upsert',
    defaultMessage: 'No eligible identifier to push',
  },
  noEligibleDelete: {
    id: 'feed.noEligibleIdentifier.delete',
    defaultMessage: 'No eligible identifier to remove',
  },
  REJECTED: {
    id: 'feed.rejected',
    defaultMessage: 'rejected',
  },
  FAILURE: {
    id: 'feed.failure',
    defaultMessage: 'failed',
  },
});
