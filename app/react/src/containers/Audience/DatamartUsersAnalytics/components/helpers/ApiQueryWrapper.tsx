import * as React from 'react';
import FormatDataToChart from './FormatDataToChart';
import { Chart } from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { ReportView } from '../../../../../models/ReportView';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import {
  DatamartUsersAnalyticsMetric,
  DatamartUsersAnalyticsDimension,
} from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import { MetricCounterLoader } from '../MetricCounterLoader';
import McsMoment from '../../../../../utils/McsMoment';
import { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { withRouter, RouteComponentProps } from 'react-router';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../../../Segments/Dashboard/constants';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { orderBy, intersection, isEqual } from 'lodash';
import { LoadingChart } from '@mediarithmics-private/mcs-components-library';

type Props = ApiQueryWrapperProps &
  InjectedNotificationProps &
  RouteComponentProps<{}>;

export interface ApiQueryWrapperProps {
  chart: Chart;
  datamartId: string;
  dateRange: McsDateRangeValue;
  segmentId?: string;
  segmentName?: string;
  compareWithSegmentId?: string;
  compareWithSegmentName?: string;
  onChange: (isLoading: boolean) => void;
  segmentToAggregate?: boolean; // To remove
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

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      chart,
      dateRange,
      onChange,
      segmentId,
      compareWithSegmentId,
      location: { search },
      segmentToAggregate,
    } = this.props;

    if (
      !isEqual(prevProps.dateRange, dateRange) ||
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
  
  // TODO: date range should not be undefined  
  getDataRangeValues = () => {
    const { dateRange } = this.props;
    if (!dateRange.from.value || !dateRange.to.value) {
      return [new McsMoment('now-8d'), new McsMoment('now-1d')];
    }
    return [dateRange.from, dateRange.to];
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
    const { chart } = this.props;

    this.setState({
      loading: true,
    });
    onChange(true);

    let getTenHigherValues: string[] = [];

    if (dimensions && dimensions.includes('date_yyyy_mm_dd')) {
      const dimensionsWithoutTime = dimensions
        .slice()
        .filter(d => d !== 'date_yyyy_mm_dd');
      return this._datamartUsersAnalyticsService
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
            getTenHigherValues = sortedNormalizedData.slice(0, 11).map(item => {
              if (chart.filterBy) {
                return item[chart.filterBy];
              }
            });
          }

          return this.doFetchAnalytics(
            onChange,
            datamartId,
            metric,
            from,
            to,
            dimensions,
            dimensionFilterClauses,
            segmentId,
            compareWithSegmentId,
            getTenHigherValues,
          );
        });
    }

    return this.doFetchAnalytics(
      onChange,
      datamartId,
      metric,
      from,
      to,
      dimensions,
      dimensionFilterClauses,
      segmentId,
      compareWithSegmentId,
    );
  };

  doFetchAnalytics = (
    onChange: (isLoading: boolean) => void,
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
    segmentId?: string,
    compareWithSegmentId?: string,
    tenHigherValues?: string[],
  ) => {
    return this._datamartUsersAnalyticsService
      .getAnalytics(
        datamartId,
        metric,
        from,
        to,
        dimensions,
        dimensionFilterClauses,
        compareWithSegmentId || segmentId,
        this.getSegmentIdToAddToDimensionFilterClause(!!compareWithSegmentId),
      )
      .then(res => {
        if (tenHigherValues && tenHigherValues.length > 0) {
          const filteredReportRows = res.data.report_view.rows.filter(
            item => intersection(item, tenHigherValues).length > 0,
          );
          res.data.report_view.rows = filteredReportRows;
        }

        if (!compareWithSegmentId) {
          this.setState({
            loading: false,
            reportViewApiResponse: res.data.report_view,
          });
        } else {
          this.setState({
            loading: false,
            reportViewApiResponseToCompareWith: res.data.report_view,
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
    return segmentToAggregate && filter.segments.length === 1 && isSegmentToAdd
      ? filter.segments[0]
      : undefined;
  };

  render() {
    const { chart, segmentName, compareWithSegmentName } = this.props;
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

    return (
      <div className={'mcs-datamartUsersAnalytics_component_charts'}>
        {reportViewApiResponse && (
          <FormatDataToChart
            apiResponse={reportViewApiResponse}
            apiResponseToCompareWith={reportViewApiResponseToCompareWith}
            chart={chart}
            resourceNames={{
              resourceName: segmentName,
              compareWithSegmentName: compareWithSegmentName,
            }}
          />
        )}
      </div>
    );
  }
}

export default compose<ApiQueryWrapperProps, ApiQueryWrapperProps>(
  injectNotifications,
  withRouter,
)(ApiQueryWrapper);
