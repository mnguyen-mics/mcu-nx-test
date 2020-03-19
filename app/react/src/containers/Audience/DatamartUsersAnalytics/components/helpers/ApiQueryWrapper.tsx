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
  onChange: (isLoading: boolean) => void;
}

interface State {
  loading: boolean;
  reportViewApiResponse?: ReportView
}

class ApiQueryWrapper extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      reportViewApiResponse: undefined
    };
  }
  componentDidMount() {
    const { 
      datamartId, 
      chart,
      onChange
    } = this.props;
      this.fetchAnalytics(
        onChange,
        datamartId, 
        chart.metricName, 
        new McsMoment('now-8d'), 
        new McsMoment('now-1d'), 
        chart.dimensions, 
        chart.dimensionFilterClauses
      );
  }

  componentDidUpdate(prevProps: ApiQueryWrapperProps) {
    const { 
      datamartId, 
      chart, 
      dateRange,
      onChange
    } = this.props;
    if (
      (prevProps.dateRange.from.value && prevProps.dateRange.to.value) && 
      (prevProps.dateRange.from.value !== dateRange.from.value || prevProps.dateRange.to.value !== dateRange.to.value)) {
      this.fetchAnalytics(
        onChange,
        datamartId, 
        chart.metricName, 
        dateRange.from, 
        dateRange.to, 
        chart.dimensions, 
        chart.dimensionFilterClauses,
      );
    }
  }
  
  fetchAnalytics = (
    onChange: (isLoading: boolean) => void,
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric,
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,

  ) => {
    this.setState({
      loading: true
    });
    onChange(true);
    return this._datamartUsersAnalyticsService.getAnalytics(datamartId, metric, from, to, dimensions, dimensionFilterClauses)
      .then(res => {
        this.setState({
          loading: false,
          reportViewApiResponse: res.data.report_view
        });
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
    const { chart, intl } = this.props;
    const { loading, reportViewApiResponse } = this.state;

    if (loading) return chart.type !== 'SINGLE_STAT' ? <LoadingChart /> : <MetricCounterLoader />

    return (
      <div className={'mcs-datamartUsersAnalytics_component_charts'}>
        {reportViewApiResponse && reportViewApiResponse.total_items > 0 ?
          <FormatDataToChart apiResponse={reportViewApiResponse} chart={chart} /> : this.getEmptyDataComponent(chart.type, intl.formatMessage(messages.noData))}
      </div>
    )
  }
}

export default compose<ApiQueryWrapperProps, ApiQueryWrapperProps>(
  injectNotifications,
  injectIntl
)(ApiQueryWrapper);
