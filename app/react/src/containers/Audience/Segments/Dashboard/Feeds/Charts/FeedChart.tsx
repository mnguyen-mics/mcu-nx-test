import * as React from 'react';
import {
  buildFeedStatsByFeedRequestBody,
  FeedStatsUnit,
} from '../../../../../../utils/FeedsStatsReportHelper';
import { IFeedsStatsService } from '../../../../../../services/FeedsStatsService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
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
import { formatMcsDate } from '../../../../../../utils/McsMoment';
import { Card } from 'antd';
import {
  StackedBarPlot,
  LoadingChart,
} from '@mediarithmics-private/mcs-components-library';
import moment from 'moment';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { getAllDates } from '../../../../../../utils/DateHelper';

interface FeedChartProps {
  title?: React.ReactNode;
  organisationId: string;
  feedId: string;
  feedStatsUnit?: FeedStatsUnit;
  dateRange: McsDateRangeValue;
}

type Props = FeedChartProps & InjectedThemeColorsProps & InjectedIntlProps;

interface FeedReport {
  day: string;
  upserted: number;
  deleted: number;
  unit: FeedStatsUnit;
}

interface State {
  dataSource: FeedReport[];
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

    return formatedNonInclusiveDateRange.from ===
      formatedNonInclusiveDateRange.to
      ? 'HOUR'
      : 'DAY';
  }

  fetchStats() {
    const { organisationId, feedId, feedStatsUnit, dateRange } = this.props;

    this.setState({
      isLoading: true,
    });

    if (!feedStatsUnit) {
      throw new Error(`Undefined 'feedStatsUnit'`);
    }

    const formatedInclusiveDateRange = formatMcsDate(dateRange, true);

    const formatedNonInclusiveDateRange = formatMcsDate(dateRange);

    const timeUnit = this.getTimeUnit();

    const allDates = getAllDates(timeUnit, formatedNonInclusiveDateRange);

    const reportBody = buildFeedStatsByFeedRequestBody(
      feedId,
      {
        start_date: formatedInclusiveDateRange.from,
        end_date: formatedInclusiveDateRange.to,
      },
      timeUnit,
      ['UNIQ_USER_POINTS_COUNT', 'UNIQ_USER_IDENTIFIERS_COUNT'],
    );

    return this._feedsStatsService
      .getStats(organisationId, reportBody)
      .then((res) => {
        const normalized = normalizeReportView<{
          hour: string;
          date_yyyy_mm_dd: string;
          sync_type: string;
          uniq_user_points_count: number;
          uniq_user_identifiers_count: number;
        }>(res.data.report_view);

        const upserts = normalized.filter((rv) => rv.sync_type === 'UPSERT');
        const deletes = normalized.filter((rv) => rv.sync_type === 'DELETE');

        let feedReports: FeedReport[] = allDates.map((day) => {
          const upsertedOnDay = upserts.find(
            (r) => (timeUnit === 'HOUR' ? r.hour : r.date_yyyy_mm_dd) === day,
          );
          const deletedOnDay = deletes.find(
            (r) => (timeUnit === 'HOUR' ? r.hour : r.date_yyyy_mm_dd) === day,
          );

          return {
            day: timeUnit === 'HOUR' ? moment(day).format('HH:mm') : day,
            upserted: upsertedOnDay
              ? feedStatsUnit === 'USER_POINTS'
                ? upsertedOnDay.uniq_user_points_count
                : upsertedOnDay.uniq_user_identifiers_count
              : 0,
            deleted: deletedOnDay
              ? feedStatsUnit === 'USER_POINTS'
                ? deletedOnDay.uniq_user_points_count
                : deletedOnDay.uniq_user_identifiers_count
              : 0,
            unit: feedStatsUnit,
          };
        });

        feedReports = feedReports.sort((report1, report2) =>
          report1.day.localeCompare(report2.day),
        );

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
    const {
      colors,
      title,
      intl: { formatMessage },
    } = this.props;
    const { dataSource, isLoading } = this.state;

    const metrics =
      dataSource && dataSource[0]
        ? Object.keys(dataSource[0]).filter(
            (el) => el !== 'day' && el !== 'unit',
          )
        : [];

    const optionsForChart = {
      xKey: 'day',
      yKeys: metrics.map((metric) => {
        if (dataSource[0].unit === 'USER_POINTS') {
          if (metric === 'upserted') {
            return {
              key: metric,
              message: formatMessage(messagesMap.upserted_user_points),
            };
          } else if (metric === 'deleted') {
            return {
              key: metric,
              message: formatMessage(messagesMap.deleted_user_points),
            };
          } else {
            throw new Error(`Unsupported metric: ${metric}`);
          }
        } else if (dataSource[0].unit === 'USER_IDENTIFIERS') {
          if (metric === 'upserted') {
            return {
              key: metric,
              message: formatMessage(messagesMap.upserted_identifiers),
            };
          } else if (metric === 'deleted') {
            return {
              key: metric,
              message: formatMessage(messagesMap.deleted_identifiers),
            };
          } else {
            throw new Error(`Unsupported metric: ${metric}`);
          }
        } else {
          throw new Error(`Unsupported unit: ${dataSource[0].unit}`);
        }
      }),
      colors: [colors['mcs-info'], colors['mcs-error']],
      showLegend: true,
    };

    return (
      <div className="mcs-feed-chart">
        {isLoading ? (
          <LoadingChart />
        ) : (
          <Card className="compact" title={title}>
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
  upserted_identifiers: {
    id: 'feed.upserted_identifiers',
    defaultMessage: 'Upserted Identifiers',
  },
  deleted_identifiers: {
    id: 'feed.deleted_identifiers',
    defaultMessage: 'Deleted Identifiers',
  },
});
