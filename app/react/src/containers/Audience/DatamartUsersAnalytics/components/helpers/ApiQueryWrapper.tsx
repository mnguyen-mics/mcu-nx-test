import * as React from 'react';
import FormatDataToChart from './FormatDataToChart';
import { Chart } from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { ReportView } from '../../../../../models/ReportView';
import { LoadingChart, EmptyCharts } from '../../../../../components/EmptyCharts';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { DatamartUsersAnalyticsMetric, DatamartUsersAnalyticsDimension } from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import { MetricCounterLoader } from '../MetricCounterLoader';
import McsMoment from '../../../../../utils/McsMoment';
import { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import { EmptyRecords } from '../../../../../components';

const messages = defineMessages({
  noData: {
    id: 'datamartUsersAnalytics.noData',
    defaultMessage: 'No data'
  }
});

type Props = ApiQueryWrapperProps & InjectedNotificationProps & InjectedIntlProps;

export interface ApiQueryWrapperProps {
  chart: Chart;
  datamartId: string;
  dateRange: McsDateRangeValue;
  segmentId?: string;
  compareWithSegmentId?: string;
  onChange: (isLoading: boolean) => void;
  mergeDataSet?: boolean;
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
      loading: true
    };
  }
  componentDidMount() {
    const { 
      datamartId, 
      chart,
      onChange,
      segmentId,
      compareWithSegmentId,
      dateRange
    } = this.props;

    if (!dateRange.from.value || !dateRange.to.value) {
      dateRange.from = new McsMoment('now-8d');
      dateRange.to = new McsMoment('now-1d');
    }

      this.fetchAnalytics(
        onChange,
        datamartId, 
        chart.metricNames, 
        dateRange.from,
        dateRange.to, 
        chart.dimensions, 
        chart.dimensionFilterClauses,
        segmentId
      );
      if (compareWithSegmentId) {
        this.fetchAnalytics(
          onChange,
          datamartId, 
          chart.metricNames, 
          dateRange.from,
          dateRange.to,  
          chart.dimensions, 
          chart.dimensionFilterClauses,
          segmentId,
          compareWithSegmentId
        );
      }

  }

  componentDidUpdate(prevProps: ApiQueryWrapperProps) {
    const { 
      datamartId, 
      chart, 
      dateRange,
      onChange,
      segmentId,
      compareWithSegmentId
    } = this.props;
    if (
      (prevProps.dateRange.from.value && prevProps.dateRange.to.value) && 
      (prevProps.dateRange.from.value !== dateRange.from.value || prevProps.dateRange.to.value !== dateRange.to.value) ||
      prevProps.compareWithSegmentId !== compareWithSegmentId ||
      prevProps.segmentId !== segmentId
      ) {
      this.fetchAnalytics(
        onChange,
        datamartId, 
        chart.metricNames, 
        dateRange.from, 
        dateRange.to, 
        chart.dimensions, 
        chart.dimensionFilterClauses,
        segmentId
      );

      if (compareWithSegmentId) {
        this.fetchAnalytics(
          onChange,
          datamartId, 
          chart.metricNames, 
          dateRange.from, 
          dateRange.to, 
          chart.dimensions, 
          chart.dimensionFilterClauses,
          segmentId,
          compareWithSegmentId
        );
      }
    }
  }

  formatReportView = (reportView: ReportView, isBaseSegment: boolean, mergeDataSet: boolean= false) => {
    let newReportView: ReportView; 
    const newHeaders = ['resource_name'].concat(reportView.columns_headers);
    const newRows = reportView.rows.map(r => [isBaseSegment ? 'Experimentation Segment' : 'Control Group Segment'].concat(r));
    if (mergeDataSet) {
      newReportView = {
        ...reportView,
        columns_headers: newHeaders,
        rows: newRows
      }
    } else {
      newReportView = reportView
    }
    return newReportView;
  }
  
  fetchAnalytics = (
    onChange: (isLoading: boolean) => void,
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
    segmentId?: string,
    compareWithSegmentId?: string
  ) => {
    const {
      mergeDataSet
    } = this.props;
    this.setState({
      loading: true
    });
    onChange(true);
    this._datamartUsersAnalyticsService.getAnalytics(datamartId, metric, from, to, dimensions, dimensionFilterClauses, compareWithSegmentId || segmentId)
      .then(res => {
        if (!compareWithSegmentId) {
          this.setState({
            loading: false,
            reportViewApiResponse: this.formatReportView(res.data.report_view, true, mergeDataSet)
          });
        } else {
          this.setState({
            loading: false,
            reportViewApiResponseToCompareWith: this.formatReportView(res.data.report_view, false, mergeDataSet)
          });
        }
        onChange(false);
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          loading: false
        });
        onChange(false);
      });
  }

  getEmptyDataComponent(chartType: string, message: string) {
    return chartType !== 'SINGLE_STAT' ? <EmptyCharts title={message} /> : <EmptyRecords message={message} />;
  }

  render() {
    const { chart, intl, mergeDataSet } = this.props;
    const { loading, reportViewApiResponse, reportViewApiResponseToCompareWith } = this.state;

    if (loading) return chart.type !== 'SINGLE_STAT' ? <LoadingChart /> : <MetricCounterLoader />

    const getMergeApiResponse = (reportView: ReportView) => {
      return {
        ...reportView,
        rows: reportViewApiResponseToCompareWith ? 
        reportView.rows.concat(reportViewApiResponseToCompareWith.rows):
        reportView.rows
      }
    }

    const newChart: Chart = {
      ...chart,
      dimensions: chart.dimensions ?
      [('resource_name' as DatamartUsersAnalyticsDimension)].concat(chart.dimensions)
      : []
    }

    return (
      <div className={'mcs-datamartUsersAnalytics_component_charts'}>
        {reportViewApiResponse && reportViewApiResponse.total_items > 0 ?
          <FormatDataToChart 
            apiResponse={mergeDataSet ? getMergeApiResponse(reportViewApiResponse) : reportViewApiResponse} 
            apiResponseToCompareWith={reportViewApiResponseToCompareWith} 
            chart={mergeDataSet ? newChart : chart} /> 
            : this.getEmptyDataComponent(chart.type, intl.formatMessage(messages.noData))}
      </div>
    )
  }
}

export default compose<ApiQueryWrapperProps, ApiQueryWrapperProps>(
  injectNotifications,
  injectIntl
)(ApiQueryWrapper);