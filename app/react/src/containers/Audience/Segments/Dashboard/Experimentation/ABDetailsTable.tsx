import * as React from 'react';
import { compose } from 'recompose';
import {
  Card,
  McsDateRangePicker,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from 'antd';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import { messagesMap } from './AudienceExperimentationForm';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { parseSearch, updateSearch } from '../../../../../utils/LocationSearchHelper';
import { DatamartUsersAnalyticsMetric } from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import ExportService from '../../../../../services/ExportService';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../constants';
import { FILTERS } from '../../../../../containers/Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { formatMetric } from '../../../../../utils/MetricHelper';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { ReportViewResponse } from '../../../../../services/ReportService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

const abComparisonMessage: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  avg_number_of_transactions_per_user_point: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgNumberOfTransactionsPerUserPoint',
    defaultMessage: 'Average number of transactions per user point',
  },
  number_of_transactions: {
    id: 'audience.segment.dashboard.ABDetailsTable.numberOfTransactions',
    defaultMessage: 'Number of transactions',
  },
  avg_transaction_amount: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgTransactionAmount',
    defaultMessage: 'Average transaction amount',
  },
  avg_revenue_per_user_point: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgRevenuePerUserPoint',
    defaultMessage: 'Average Revenue Per User Point',
  },
  revenue: {
    id: 'audience.segment.dashboard.ABDetailsTable.revenue',
    defaultMessage: 'Revenue',
  },
  avg_session_duration: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgSessionDuration',
    defaultMessage: 'Average session duration',
  },
  avg_number_of_user_events: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgNumberOfUserEvents',
    defaultMessage: 'Average number of User Events',
  },
  conversion_rate: {
    id: 'audience.segment.dashboard.ABDetailsTable.conversionRate',
    defaultMessage: 'Conversion Rate',
  },
  user_points: {
    id: 'audience.segment.dashboard.ABDetailsTable.userPoints',
    defaultMessage: 'User Points',
  },
  users: {
    id: 'audience.segment.dashboard.ABDetailsTable.users',
    defaultMessage: 'Users with transactions',
  },
  export: {
    id: 'audience.segment.dashboard.ABDetailsTable.export',
    defaultMessage: 'Export',
  },
});

interface ABDetailsTableDataSource {
  metricName: string;
  experimentationMetric?: number | string;
  controlGroupMetric?: number | string;
  comparison: number | string;
}

interface State {
  isLoading: boolean;
  dataSource: ABDetailsTableDataSource[];
  isExportLoading: boolean;
}

export interface ABDetailsTableProps {
  experimentationSegment?: UserQuerySegment;
  controlGroupSegment?: UserQuerySegment;
}

type Props = ABDetailsTableProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{}>;

class ABDetailsTable extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: [],
      isExportLoading: false,
    };
  }

  componentDidMount() {
    this.fetchABDetailsDatasource();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      location: { search },
    } = this.props;

    if (prevProps.location.search !== search) {
      this.fetchABDetailsDatasource();
    }
  }

  fetchABDetailsDatasource = () => {
    const {
      experimentationSegment,
      controlGroupSegment,
      location: { search },
    } = this.props;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);

    if (experimentationSegment && !!controlGroupSegment && !!controlGroupSegment.creation_ts) {
      this.setState({
        dataSource: [
          {
            metricName: 'user_points',
            experimentationMetric: experimentationSegment.user_points_count,
            controlGroupMetric: controlGroupSegment.user_points_count,
            comparison: 'N/A',
          },
        ],
      });
      const dimensionFilterClauses: DimensionFilterClause = {
        operator: 'OR',
        filters: [
          {
            dimension_name: 'type',
            not: false,
            operator: 'IN_LIST',
            expressions: ['SITE_VISIT', 'APP_VISIT'],
            case_sensitive: false,
          },
        ],
      };

      const getPromise = (
        segmentId: string,
        metricName: DatamartUsersAnalyticsMetric,
        isSegmentToAdd: boolean = false,
      ) => {
        return this._datamartUsersAnalyticsService.getAnalytics(
          experimentationSegment.datamart_id,
          [metricName],
          filter.from,
          filter.to,
          metricName === 'users' ? ['number_of_confirmed_transactions'] : [],
          dimensionFilterClauses,
          segmentId,
          isSegmentToAdd && filter.segments.length === 1 ? filter.segments[0] : undefined,
        );
      };
      const metricList: DatamartUsersAnalyticsMetric[] = [
        'avg_number_of_transactions_per_user_point',
        'number_of_transactions',
        'avg_transaction_amount',
        'avg_revenue_per_user_point',
        'revenue',
        'avg_session_duration',
        'avg_number_of_user_events',
        'conversion_rate',
        'users',
      ];
      metricList.forEach(metric => {
        return Promise.all([
          getPromise(experimentationSegment.id, metric, true),
          getPromise(controlGroupSegment.id, metric),
        ])
          .then(res => {
            let experimentationMetric = res[0].data.report_view.rows[0][0];
            let controlGroupMetric = res[1].data.report_view.rows[0][0];
            const getComparison = () => {
              // these metrics are not average values so we don't want comparison
              if (
                metric === 'number_of_transactions' ||
                metric === 'revenue' ||
                metric === 'users'
              ) {
                return '-';
              }
              return typeof experimentationMetric === 'number' &&
                typeof controlGroupMetric === 'number' &&
                controlGroupMetric !== 0
                ? Math.abs((controlGroupMetric - experimentationMetric) / controlGroupMetric)
                : '-';
            };
            // For users metric, we have added 'number_of_confirmed_transactions' dimension to the call
            // (see getPromise function) because we want the number of users with transactions.
            // Here we just sum users if number of transactions is >= 1
            if (metric === 'users') {
              const sumUsers = (reportView: ReportViewResponse) => {
                return reportView.data.report_view.rows
                  .filter(r => r[0] !== 0)
                  .map(r => r[1])
                  .reduce((a, b) => {
                    return a + b;
                  }, 0);
              };
              experimentationMetric = sumUsers(res[0]);
              controlGroupMetric = sumUsers(res[1]);
            }
            return {
              metricName: metric,
              experimentationMetric: experimentationMetric,
              controlGroupMetric: controlGroupMetric,
              comparison: getComparison(),
            };
          })
          .then(data => {
            this.setState(prevState => {
              const newState = {
                dataSource: prevState.dataSource.concat(data),
                isLoading: false,
              };
              return newState;
            });
          })
          .catch(error => {
            this.props.notifyError(error);
            this.setState({
              isLoading: false,
            });
          });
      });
    }
  };

  getExport = () => {
    const {
      experimentationSegment,
      intl: { formatMessage },
    } = this.props;
    const { dataSource } = this.state;
    this.setState({
      isExportLoading: true,
    });
    if (experimentationSegment) {
      ExportService.exportABComparison(experimentationSegment, dataSource, formatMessage);
      this.setState({
        isExportLoading: false,
      });
    }
  };

  buildDataColumns = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const dataColumns: Array<DataColumnDefinition<any>> = [
      {
        key: 'metricName',
        isHideable: false,
        render: (text: string) => formatMessage(abComparisonMessage[text]),
      },
      {
        title: formatMessage(messagesMap.experimentationSegmentName),
        key: 'experimentationMetric',
        isHideable: false,
        render: (text: string, record: ABDetailsTableDataSource) => {
          return formatMetric(
            text,
            `${record.metricName === 'conversion_rate' ? '0,0.00%' : '0,0.00'}`,
          );
        },
      },
      {
        title: formatMessage(messagesMap.controlGroupSegmentName),
        key: 'controlGroupMetric',
        isHideable: false,
        render: (text: string, record: ABDetailsTableDataSource) => {
          return formatMetric(
            text,
            `${record.metricName === 'conversion_rate' ? '0,0.00%' : '0,0.00'}`,
          );
        },
      },
      {
        title: formatMessage(messagesMap.uplift),
        key: 'comparison',
        isHideable: false,
        render: (text: string, record: ABDetailsTableDataSource) => {
          return record.metricName !== 'User Points' ? `${formatMetric(text, '0.00%')}` : text;
        },
      },
    ];

    return dataColumns;
  };

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATAMART_USERS_ANALYTICS_SETTING),
    };

    history.push(nextLocation);
  };

  renderDatePicker() {
    const {
      location: { search },
      controlGroupSegment,
    } = this.props;

    const { isLoading } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        disabled={isLoading}
        excludeToday={true}
        startDate={controlGroupSegment && controlGroupSegment.creation_ts}
        messages={mcsdatePickerMsg}
        className='mcs-datePicker_container'
      />
    );
  }

  render() {
    const { isLoading, dataSource, isExportLoading } = this.state;

    return (
      <Card
        buttons={
          <React.Fragment>
            <Button
              onClick={this.getExport}
              loading={isExportLoading}
              type='primary'
              className='mcs-audienceSegmentDashboard_abExportButton'
            >
              <FormattedMessage {...abComparisonMessage.export} />
            </Button>
            {this.renderDatePicker()}
          </React.Fragment>
        }
        className='mcs-table-container'
      >
        <TableViewFilters
          columns={this.buildDataColumns()}
          loading={isLoading}
          dataSource={dataSource}
        />
      </Card>
    );
  }
}

export default compose<Props, ABDetailsTableProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(ABDetailsTable);
