import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { Tooltip, Progress } from 'antd';
import { messages } from './messages';
import { DatamartReplicationJobExecutionResource } from '../../../../../models/settings/settings';
import {
  TableViewFilters,
} from '../../../../../components/TableView';
import { McsIcon } from '../../../../../components';
import { getExecutionInfo } from '../../../../../utils/JobHelpers';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { Filters } from '../../../../../components/ItemList';
import { Index } from '../../../../../utils';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';

interface DatamartReplicationJobTableProps {
  dataSource: DatamartReplicationJobExecutionResource[];
  isLoading: boolean;
  total: number;
  noItem: boolean;
  onFilterChange: (newFilter: Index<string | number>) => void;
}

type Props = DatamartReplicationJobTableProps &
  InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
  }>;

class DatamartReplicationJobTable extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingJobExecutions: false,
      jobExecutions: [],
      totalJobExecutions: 0,
    };
  }

  renderStatuColumn = (record: DatamartReplicationJobExecutionResource) => {
    switch (record.status) {
      case 'SUCCEEDED':
      case 'SUCCESS':
        return (
          <div>
            {record.status}{' '}
            {record.result &&
              record.result.total_failure &&
              record.result.total_failure > 0 && (
                <span>
                  - with errors{' '}
                  {record.error && record.error.message && (
                    <Tooltip
                      placement="top"
                      title={record.error && record.error.message}
                    >
                      <McsIcon type="question" />
                    </Tooltip>
                  )}
                </span>
              )}
          </div>
        );
      default:
        return <div>{record.status}</div>;
    }
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
      colors,
    } = this.props;

    return [
      {
        intlMessage: messages.executionId,
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.executionStatus,
        key: 'status',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) => this.renderStatuColumn(record),
      },
      {
        intlMessage: messages.executionProgress,
        key: 'progress',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) => (
          // we should update ant design in order to have strokeColor prop
          // currently we can't pass color
          // https://github.com/ant-design/ant-design/blob/master/components/progress/progress.tsx
          <div>
            <Progress
              showInfo={false}
              percent={getExecutionInfo(record, colors).percent * 100}
            />
          </div>
        ),
      },
      {
        intlMessage: messages.executionStartDate,
        key: 'start_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.executionNotStarted),
      },
      {
        intlMessage: messages.executionEndDate,
        key: 'end_date',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) =>
          record.start_date && record.duration
            ? moment(record.start_date + record.duration).format(
                'DD/MM/YYYY HH:mm:ss',
              )
            : formatMessage(messages.executionNotEnded),
      },
      {
        intlMessage: messages.executionCreationDate,
        key: 'creation_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.executionNotCreated),
      },
    ];
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      location: { search },
      total,
      isLoading,
      dataSource,
      noItem,
      intl
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
      total: total,
    };

    return noItem && !isLoading ? (
      <EmptyTableView
        iconType="settings"
        message={intl.formatMessage(messages.emptyInitialSynchronizationList)}
        className="mcs-table-view-empty mcs-empty-card"
      />
    ) : (
      <TableViewFilters
        dataSource={dataSource}
        columns={this.buildColumnDefinition()}
        pagination={pagination}
        loading={isLoading}
      />
    );
  }
}

export default compose<Props, DatamartReplicationJobTableProps>(
  withRouter,
  injectIntl,
  injectThemeColors,
  injectNotifications,
)(DatamartReplicationJobTable);
