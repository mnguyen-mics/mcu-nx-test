import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../../components/TableView';
import messages from './messages';
import {
  ChannelResource,
  DatamartReplicationResource,
} from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { DATAMART_REPLICATION_SEARCH_SETTINGS } from './DatamartReplicationListPage';

export interface DatamartReplicationTableProps {
  isLoading: boolean;
  dataSource: DatamartReplicationResource[];
  total: number;
  noItem: boolean;
  onFilterChange: (newFilter: Partial<Filter>) => void;
}

type Props = DatamartReplicationTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DatamartReplicationTable extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      total,
      onFilterChange,
      noItem,
      isLoading,
      dataSource,
      match: {
        params: { organisationId },
      },
      location: { search },
      history,
    } = this.props;
    const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: total,
      onChange: (page: number, size: number) =>
        onFilterChange({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messages.datamartReplicationName,
        key: 'name',
        isHideable: false,
        render: (text: string, record: DatamartReplicationResource) => {
          return (
            <Link
              to={`/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/datamart_replication/${record.id}/edit`}
            >
              {text}
            </Link>
          );
        },
      },
      {
        intlMessage: messages.datamartReplicationDatamartId,
        key: 'datamart_id',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
    ];

    const onEditDatamartReplication = (record: DatamartReplicationResource) => {
      history.push({
        pathname: `/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/datamart_replication/${record.id}/edit`,
        state: { from: `${location.pathname}${location.search}` },
      });
    };

    const actionColumns: Array<ActionsColumnDefinition<ChannelResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editDatamartReplication,
            callback: onEditDatamartReplication,
          },
        ],
      },
    ];

    const searchOptions = {
      placeholder: formatMessage(messages.searchPlaceholder),
      onSearch: (value: string) =>
        onFilterChange({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    return noItem ? (
      <EmptyTableView
        iconType="settings"
        intlMessage={messages.emptyDatamartReplication}
        className="mcs-table-view-empty mcs-empty-card"
      />
    ) : (
      <TableViewFilters
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        searchOptions={searchOptions}
        dataSource={dataSource}
        loading={isLoading}
        pagination={pagination}
      />
    );
  }
}

export default compose<Props, DatamartReplicationTableProps>(
  injectIntl,
  withRouter,
)(DatamartReplicationTable);
