import * as React from 'react';
import FormatDataToChart from './FormatDataToChart';
import { Chart } from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { ReportView } from '../../../../../models/ReportView';
import {
  LoadingChart,
  EmptyCharts,
} from '../../../../../components/EmptyCharts';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import {
  DatamartUsersAnalyticsMetric,
  DatamartUsersAnalyticsDimension,
} from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import { MetricCounterLoader } from '../MetricCounterLoader';
import McsMoment from '../../../../../utils/McsMoment';
import { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import { EmptyRecords } from '../../../../../components';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { withRouter, RouteComponentProps } from 'react-router';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../../../Segments/Dashboard/constants';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { orderBy, intersection, filter } from 'lodash';

const messages = defineMessages({
  noData: {
    id: 'datamartUsersAnalytics.noData',
    defaultMessage: 'No data',
  },
});

type Props = ApiQueryWrapperProps &
  InjectedNotificationProps &
  RouteComponentProps<{}> &
  InjectedIntlProps;

export interface ApiQueryWrapperProps {
  chart: Chart;
  datamartId: string;
  dateRange: McsDateRangeValue;
  segmentId?: string;
  segmentName?: string;
  compareWithSegmentId?: string;
  compareWithSegmentName?: string;
  onChange: (isLoading: boolean) => void;
  enhancedManualReportView?: boolean;
  segmentToAggregate?: boolean;
}

interface State {
  loading: boolean;
  reportViewApiResponse?: ReportView;
  reportViewApiResponseToCompareWith?: ReportView;
}

class ApiQueryWrapper extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const {
      datamartId,
      chart,
      onChange,
      segmentId,
      compareWithSegmentId,
    } = this.props;

    this.fetchAnalytics(
      onChange,
      datamartId,
      chart.metricNames,
      this.getDataRangeValues()[0],
      this.getDataRangeValues()[1],
      chart.dimensions,
      chart.dimensionFilterClauses,
      segmentId
    ).then(() => {
      if (compareWithSegmentId) {
        this.fetchAnalytics(
          onChange,
          datamartId,
          chart.metricNames,
          this.getDataRangeValues()[0],
          this.getDataRangeValues()[1],
          chart.dimensions,
          chart.dimensionFilterClauses,
          segmentId,
          compareWithSegmentId,
        );
      }
    });
  }

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      chart,
      dateRange,
      onChange,
      segmentId,
      compareWithSegmentId,
      location: { search },
      segmentToAggregate
    } = this.props;

    if (
      (prevProps.dateRange.from.value &&
        prevProps.dateRange.to.value &&
        (prevProps.dateRange.from.value !== dateRange.from.value ||
          prevProps.dateRange.to.value !== dateRange.to.value)) ||
      prevProps.segmentId !== segmentId ||
      prevProps.compareWithSegmentId !== compareWithSegmentId ||
      (prevProps.location.search !== search && segmentToAggregate)
    ) {
      this.fetchAnalytics(
        onChange,
        datamartId,
        chart.metricNames,
        this.getDataRangeValues()[0],
        this.getDataRangeValues()[1],
        chart.dimensions,
        chart.dimensionFilterClauses,
        segmentId,
      ).then(() => {
        if (compareWithSegmentId) {
          this.fetchAnalytics(
            onChange,
            datamartId,
            chart.metricNames,
            this.getDataRangeValues()[0],
            this.getDataRangeValues()[1],
            chart.dimensions,
            chart.dimensionFilterClauses,
            segmentId,
            compareWithSegmentId,
          );
        }
      });
    }
  }

  getDataRangeValues = () => {
    const { dateRange } = this.props;
    if (!dateRange.from.value || !dateRange.to.value) {
      return [new McsMoment('now-8d'), new McsMoment('now-1d')];
    }
    return [dateRange.from, dateRange.to];
  };

  formatReportView = (
    reportView: ReportView,
    enhancedManualReportView: boolean = false,
    resourceName?: string,
  ) => {
    let newReportView: ReportView;
    const newHeaders = ['resource_name'].concat(reportView.columns_headers);
    const newRows = reportView.rows.map(r => [resourceName].concat(r));
    if (enhancedManualReportView) {
      newReportView = {
        ...reportView,
        columns_headers: newHeaders,
        rows: newRows,
      };
    } else {
      newReportView = reportView;
    }
    return newReportView;
  };

  fetchAnalytics = (
    onChange: (isLoading: boolean) => void,
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
    segmentId?: string,
    compareWithSegmentId?: string,
  ) => {
    const {
      enhancedManualReportView,
      segmentName,
      compareWithSegmentName,
      chart
    } = this.props;

    this.setState({
      loading: true,
    });
    onChange(true);

    let getTenMostValue: string[] = [];

    if (dimensions && dimensions.includes('date_yyyy_mm_dd')) {
      const dimensionsWithoutTime = dimensions.slice().filter(d => d !== 'date_yyyy_mm_dd');
      this._datamartUsersAnalyticsService
        .getAnalytics(
          datamartId,
          metric,
          from,
          to,
          dimensionsWithoutTime,
          dimensionFilterClauses,
          compareWithSegmentId || segmentId,
        )
        .then(res => {
          const normalizedData = normalizeReportView(res.data.report_view);
          const sortedNormalizedData = orderBy(normalizedData, metric, 'desc');
          if (sortedNormalizedData && chart.filterBy) {
            getTenMostValue = sortedNormalizedData.slice(0, 10).map(item => {
              if (chart.filterBy && item[chart.filterBy].length > 0) { return item[chart.filterBy] }
            });
          }
        });
    }

    return this._datamartUsersAnalyticsService
      .getAnalytics(
        datamartId,
        metric,
        from,
        to,
        dimensions,
        dimensionFilterClauses,
        compareWithSegmentId || segmentId,
        this.getSegmentIdToAddToDimensionFilterClause(!!compareWithSegmentId)
      )
      .then(res => {

        if (getTenMostValue && getTenMostValue.length > 0) {
          const filteredReportRows = filter(res.data.report_view.rows, item => intersection(item, getTenMostValue).length > 0);
          res.data.report_view.rows = filteredReportRows;
        }

        if (!compareWithSegmentId) {
          this.setState({
            loading: false,
            reportViewApiResponse: this.formatReportView(
              res.data.report_view,
              enhancedManualReportView,
              segmentName,
            ),
          });
        } else {
          this.setState({
            loading: false,
            reportViewApiResponseToCompareWith: this.formatReportView(
              res.data.report_view,
              enhancedManualReportView,
              compareWithSegmentName,
            ),
          });
        }
        onChange(false);
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          loading: false,
        });
        onChange(false);
      });



  };

  getSegmentIdToAddToDimensionFilterClause = (isSegmentToAdd: boolean) => {
    const {
      segmentToAggregate,
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    return segmentToAggregate &&
      filter.segments.length === 1 &&
      isSegmentToAdd
      ? filter.segments[0]
      : undefined;
  };

  getEmptyDataComponent(chartType: string, message: string) {
    return chartType !== 'SINGLE_STAT' ? (
      <EmptyCharts title={message} />
    ) : (
        <EmptyRecords message={message} />
      );
  }

  areAnalyticsReady = (items: any[]) => {
    const isItemNull = items[0] && items[0][0] === null;
    const isItemNaN = items[0] && items[0][0] === 'NaN';
    const isReady = !(isItemNull || isItemNaN);
    return isReady;
  };

  render() {
    const { chart, intl, enhancedManualReportView } = this.props;
    const {
      loading,
      reportViewApiResponse,
      reportViewApiResponseToCompareWith,
    } = this.state;

    if (loading)
      return chart.type !== 'SINGLE_STAT' ? (
        <LoadingChart />
      ) : (
          <MetricCounterLoader />
        );

    const getMergedApiResponse = (reportView: ReportView) => {
      return {
        ...reportView,
        rows: reportViewApiResponseToCompareWith
          ? reportView.rows.concat(reportViewApiResponseToCompareWith.rows)
          : reportView.rows,
      };
    };

    const enhancedChartWithDefaultDimension: Chart = {
      ...chart,
      dimensions: chart.dimensions
        ? ['resource_name' as DatamartUsersAnalyticsDimension].concat(
          chart.dimensions,
        )
        : [],
    };

    return (
      <div className={'mcs-datamartUsersAnalytics_component_charts'}>
        {reportViewApiResponse &&
          (reportViewApiResponse.total_items > 0 ||
            (reportViewApiResponseToCompareWith &&
              reportViewApiResponseToCompareWith.total_items > 0)) ? (
            this.areAnalyticsReady(reportViewApiResponse.rows) ||
              (reportViewApiResponseToCompareWith &&
                this.areAnalyticsReady(reportViewApiResponseToCompareWith.rows)) ? (
                <FormatDataToChart
                  apiResponse={
                    enhancedManualReportView
                      ? getMergedApiResponse(reportViewApiResponse)
                      : reportViewApiResponse
                  }
                  apiResponseToCompareWith={reportViewApiResponseToCompareWith}
                  chart={
                    enhancedManualReportView
                      ? enhancedChartWithDefaultDimension
                      : chart
                  }
                />
              ) : (
                // Let's keep this in case we want to display a different
                // message if datamartUserAnalytics return null/undefined
                this.getEmptyDataComponent(
                  chart.type,
                  intl.formatMessage(messages.noData),
                )
              )
          ) : (
            this.getEmptyDataComponent(
              chart.type,
              intl.formatMessage(messages.noData),
            )
          )}
      </div>
    );
  }
}

export default compose<ApiQueryWrapperProps, ApiQueryWrapperProps>(
  injectNotifications,
  injectIntl,
  withRouter,
)(ApiQueryWrapper);
