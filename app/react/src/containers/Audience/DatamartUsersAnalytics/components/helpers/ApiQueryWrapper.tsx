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
    const { datamartId, chart } = this.props;
    this.fetchAnalytics(datamartId, chart.metricName, chart.xKey, chart.dimensionFilterClauses);
  }

  fetchAnalytics = (
      datamartId: string,
      metric: DatamartUsersAnalyticsMetric,
      dimension?: DatamartUsersAnalyticsDimension, 
      dimensionFilterClauses?: DimensionFilterClause
    ) => {
    this.setState({
      loading: true
    });
    return this._datamartUsersAnalyticsService.getAnalytics(datamartId, metric, dimension, dimensionFilterClauses)
      .then(res => {
        this.setState({
          loading: false,
          reportViewApiResponse: res.data.report_view
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          loading: false
        });
      });
  }

  render() {
    const { chart, intl } = this.props;
    const { loading, reportViewApiResponse } = this.state;

    if (loading) return chart.type !== 'SINGLE_STAT' ? <LoadingChart /> : <MetricCounterLoader />

    return (
      <div className={'mcs-datamartUsersAnalytics_component_charts'}>
        {reportViewApiResponse && reportViewApiResponse.total_items > 0 ?
          <FormatDataToChart apiResponse={reportViewApiResponse} chart={chart} /> : <EmptyCharts title={intl.formatMessage(messages.noData)} />}
      </div>
    )
  }
}

export default compose<Props, ApiQueryWrapperProps>(
  injectNotifications,
  injectIntl
)(ApiQueryWrapper);
