import * as React from 'react';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import { TableViewFilters } from '../../../../../components/TableView';
import { messagesMap } from './AudienceExperimentationForm';
import { DataColumnDefinition } from '../../../../../components/TableView/TableView';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import McsMoment from '../../../../../utils/McsMoment';
import { convertTimestampToDayNumber } from '../../../../../utils/LocationSearchHelper';
import { DatamartUsersAnalyticsMetric } from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import { Button } from 'antd';
import ExportService from '../../../../../services/ExportService';
import { Card } from '@mediarithmics-private/mcs-components-library';

const abComparisonMessage: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  number_of_transactions: {
    id: 'audience.segment.dashboard.ABDetailsTable.numberOfTransactions',
    defaultMessage: 'Number of transactions',
  },
  avg_transaction_amount: {
    id: 'audience.segment.dashboard.ABDetailsTable.avgTransactionAmount',
    defaultMessage: 'Average transaction amount',
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
  InjectedNotificationProps;

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
    const { experimentationSegment, controlGroupSegment, intl } = this.props;

    if (
      experimentationSegment &&
      !!controlGroupSegment &&
      !!controlGroupSegment.creation_ts
    ) {
      this.setState({
        dataSource: [
          {
            metricName: 'User Points',
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
      ) => {
        return this._datamartUsersAnalyticsService.getAnalytics(
          experimentationSegment.datamart_id,
          [metricName],
          new McsMoment(
            `now-${convertTimestampToDayNumber(
              controlGroupSegment.creation_ts as number,
            )}d`,
          ),
          new McsMoment('now-1d'),
          [],
          dimensionFilterClauses,
          segmentId,
        );
      };
      const metricList: DatamartUsersAnalyticsMetric[] = [
        'number_of_transactions',
        'avg_transaction_amount',
        'revenue',
        'avg_session_duration',
        'avg_number_of_user_events',
        'conversion_rate',
      ];

      metricList.map(metric => {
        return Promise.all([
          getPromise(experimentationSegment.id, metric),
          getPromise(controlGroupSegment.id, metric),
        ])
          .then(res => {
            const ratio =
              controlGroupSegment &&
              controlGroupSegment.weight &&
              (metric === 'number_of_transactions' || metric === 'revenue')
                ? controlGroupSegment.weight /
                  (100 - controlGroupSegment.weight)
                : 1;
            const experimentationMetric = res[0].data.report_view.rows[0][0];
            const controlGroupMetric = res[1].data.report_view.rows[0][0];
            const getComparison = () => {
              return typeof experimentationMetric === 'number' &&
                typeof controlGroupMetric === 'number' &&
                controlGroupMetric !== 0
                ? Math.abs(
                    ((controlGroupMetric * ratio - experimentationMetric) /
                      (controlGroupMetric * ratio)) *
                      100,
                  ).toFixed(2)
                : '-';
            };
            return {
              metricName: intl.formatMessage(abComparisonMessage[metric]),
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
  }

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
      ExportService.exportABComparison(
        experimentationSegment,
        dataSource,
        formatMessage,
      );
      this.setState({
        isExportLoading: false,
      });
    }
  };

  buildDataColumns = () => {
    const dataColumns: Array<DataColumnDefinition<any>> = [
      {
        key: 'metricName',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messagesMap.experimentationSegmentName,
        key: 'experimentationMetric',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messagesMap.controlGroupSegmentName,
        key: 'controlGroupMetric',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messagesMap.uplift,
        key: 'comparison',
        isHideable: false,
        render: (text: string, record: ABDetailsTableDataSource) => {
          return record.metricName === 'User Points' ? text : `${text} %`;
        },
      },
    ];

    return dataColumns;
  };

  render() {
    const { isLoading, dataSource, isExportLoading } = this.state;
    return (
      <Card
        buttons={
          <Button onClick={this.getExport} loading={isExportLoading}>
            <FormattedMessage {...abComparisonMessage.export} />
          </Button>
        }
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
  injectIntl,
  injectNotifications,
)(ABDetailsTable);
