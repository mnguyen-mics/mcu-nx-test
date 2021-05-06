import { Loading, StackedAreaPlot, Card } from '@mediarithmics-private/mcs-components-library';
import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import {
  ScenarioAnalyticsDimension,
  ScenarioAnalyticsMetric,
} from '../../../../../../utils/ScenarioAnalyticsReportHelper';
import { Index } from '../../../../../../utils';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../../Helpers/injectThemeColors';
import { AnalyticsEntity } from '../ScenarioAnalyticsGenericDashboard/ScenarioAnalyticsGenericDashboard';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IScenarioAnalyticsService } from '../../../../../../services/ScenarioAnalyticsService';
import { ReportViewResponse } from '../../../../../../services/ReportService';
import { DimensionFilterClause } from '../../../../../../models/ReportRequestBody';
import McsMoment, { formatMcsDate } from '../../../../../../utils/McsMoment';
import { getAllDates } from '../../../../../../utils/DateHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { StackedAreaPlotProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/time-based-charts/stacked-area-plot';

const messages = defineMessages({
  users: {
    id: 'automationDashboardPage.analyticsDrawer.usersLine',
    defaultMessage: 'Users',
  },
});

export interface UserPointsLineChartProps {
  graphTitle: string;
  datamartId: string;
  analyticsEntity: AnalyticsEntity;
  dateRange?: McsDateRangeValue;
}

interface LineData {
  day: string;
  user_points_count: number;
}

type Props = UserPointsLineChartProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps;

type State = {
  isLoading: boolean;
  data: Array<Index<any>>;
  mode: 'DAY' | 'HOUR';
};

class UserPointsLineChart extends React.Component<Props, State> {
  @lazyInject(TYPES.IScenarioAnalyticsService)
  private _scenarioAnalyticsService: IScenarioAnalyticsService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      data: [],
      mode: 'DAY',
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
    const { isLoading } = this.state;

    if (
      (analyticsEntity !== previousAnalyticsEntity || dateRange !== previousDateRange) &&
      !isLoading
    )
      this.fetchAndComputeData();
  }

  fetchAndComputeData = () => {
    const { analyticsEntity, dateRange, datamartId, notifyError } = this.props;

    if (dateRange) {
      this.setState({ isLoading: true }, () => {
        const now = new McsMoment('now');
        const isDateRangeToday =
          dateRange.from.value === now.value && dateRange.to.value === now.value;
        const formatedInclusiveDateRange = formatMcsDate(dateRange, true);

        const formatedNonInclusiveDateRange = formatMcsDate(dateRange);

        const timeUnit =
          formatedNonInclusiveDateRange.from === formatedNonInclusiveDateRange.to ? 'HOUR' : 'DAY';

        const allDates = getAllDates(timeUnit, formatedNonInclusiveDateRange);

        const xKey = timeUnit === 'HOUR' ? 'date_yyyymmddhh' : 'date_yyyymmdd';

        const metrics: ScenarioAnalyticsMetric[] = ['user_points_count'];
        const dimensions: ScenarioAnalyticsDimension[] = [
          xKey,
          analyticsEntity.analyticsEntityType === 'NODE' ? 'node_id' : 'exit_condition_id',
        ];
        const dimensionFilterClauses: DimensionFilterClause = {
          operator: 'OR',
          filters: [
            {
              dimension_name:
                analyticsEntity.analyticsEntityType === 'NODE' ? 'NODE_ID' : 'EXIT_CONDITION_ID',
              operator: 'EXACT',
              expressions: [analyticsEntity.entityId],
            },
          ],
        };

        const reportViewResourceP: Promise<ReportViewResponse> = this._scenarioAnalyticsService.getAnalytics(
          datamartId,
          metrics,
          new McsMoment(formatedInclusiveDateRange.from),
          new McsMoment(formatedInclusiveDateRange.to),
          dimensions,
          dimensionFilterClauses,
        );

        reportViewResourceP
          .then(reportViewResource => {
            const data = normalizeReportView(reportViewResource.data.report_view).map(dataLine => {
              return {
                timeUnit: timeUnit,
                date_yyyymmddhh: timeUnit === 'HOUR' ? dataLine.date_yyyymmddhh : undefined,
                date_yyyymmdd: timeUnit === 'DAY' ? dataLine.date_yyyymmdd : undefined,
                user_points_count: dataLine.user_points_count,
              };
            });

            const enrichedData: LineData[] = allDates.map(day => {
              const foundData = data.find(
                d => (timeUnit === 'HOUR' ? d.date_yyyymmddhh : d.date_yyyymmdd) === day,
              );

              return {
                day: day,
                user_points_count: foundData ? foundData.user_points_count : 0,
              };
            });

            const filterZerosForToday = (dataForToday: LineData[]) => {
              const dataToBeReversed = dataForToday;
              dataToBeReversed.reverse();
              const filteredReverseData = dataToBeReversed.reduce(
                (acc: LineData[], line): LineData[] => {
                  if (line.user_points_count !== 0 || acc.length !== 0) {
                    return acc.concat(line);
                  } else return acc;
                },
                [],
              );
              filteredReverseData.reverse();
              return filteredReverseData;
            };

            this.setState({
              isLoading: false,
              data: isDateRangeToday ? filterZerosForToday(enrichedData) : enrichedData,
              mode: timeUnit,
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({
              isLoading: false,
              data: [],
            });
          });
      });
    }
  };

  renderStackedAreaChart = () => {
    const {
      colors,
      intl: { formatMessage },
    } = this.props;
    const { data, mode } = this.state;

    const stackedAreaPlotProps: StackedAreaPlotProps = {
      dataset: data,
      options: {
        xKey: { key: 'day', mode: mode },
        yKeys: [
          {
            key: 'user_points_count',
            message: formatMessage(messages.users),
          },
        ],
        colors: [colors['mcs-warning']],
      },
    };

    return <StackedAreaPlot {...stackedAreaPlotProps} />;
  };

  render() {
    const { graphTitle, dateRange } = this.props;
    const { isLoading } = this.state;

    const cardContent =
      isLoading || !dateRange ? <Loading isFullScreen={true} /> : this.renderStackedAreaChart();

    return <Card title={graphTitle}>{cardContent}</Card>;
  }
}

export default compose<Props, UserPointsLineChartProps>(
  injectIntl,
  injectNotifications,
  injectThemeColors,
)(UserPointsLineChart);
