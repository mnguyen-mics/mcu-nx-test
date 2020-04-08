import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import { compose } from 'recompose';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView/index';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { AudiencePartitionResource } from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { DataListResponse } from '../../../../../services/ApiService';
import { PartitionFilterParams } from './AudiencePartitionsPage';
import {
  DataColumnDefinition,
  ActionsColumnDefinition,
} from '../../../../../components/TableView/TableView';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

export interface AudiencePartitionsTableProps {
  organisationId: string;
  filter: PartitionFilterParams;
  audiencePartitions?: DataListResponse<AudiencePartitionResource>;
  fetchingPartitions: boolean;
  onChange: (filter: Partial<PartitionFilterParams>) => void;
  onArchive: (partition: AudiencePartitionResource) => void;
  onEdit: (partition: AudiencePartitionResource) => void;
}

type Props = MapStateToProps & AudiencePartitionsTableProps & InjectedIntlProps;

class AudiencePartitionTable extends TableViewFilters<
  AudiencePartitionResource
> {}

class AudiencePartitionsTable extends React.Component<Props> {
  getFiltersOptions = () => {
    const { workspace, filter, organisationId, onChange } = this.props;

    if (workspace(organisationId).datamarts.length > 1) {
      const datamartItems = workspace(organisationId)
        .datamarts.map(d => ({
          key: d.id,
          value: d.name || d.token,
        }))
        .concat([
          {
            key: '',
            value: 'All',
          },
        ]);

      return [
        {
          displayElement: (
            <div>
              <FormattedMessage id="audience.partitions.list.datamartFilter" defaultMessage="Datamart" />{' '}
              <Icon type="down" />
            </div>
          ),
          selectedItems: filter.datamartId
            ? [datamartItems.find(di => di.key === filter.datamartId)]
            : [datamartItems],
          items: datamartItems,
          singleSelectOnly: true,
          getKey: (item: any) => (item && item.key ? item.key : ''),
          display: (item: any) => item.value,
          handleItemClick: (datamartItem: { key: string; value: string }) => {
            onChange({
              datamartId:
                datamartItem && datamartItem.key ? datamartItem.key : undefined,
            });
          },
        },
      ];
    }
    return [];
  };

  render() {
    const {
      audiencePartitions,
      fetchingPartitions,
      organisationId,
      intl,
      filter,
      onChange,
      onEdit,
    } = this.props;

    const searchOptions = {
      placeholder: intl.formatMessage(messageMap.searchPlaceholder),
      onSearch: (value: string) =>
        onChange({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: audiencePartitions
        ? audiencePartitions.total || audiencePartitions.count || 0
        : 0,
      onChange: (page: number) =>
        onChange({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onChange({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const dataColumns: Array<
      DataColumnDefinition<AudiencePartitionResource>
    > = [
      {
        intlMessage: messageMap.columnName,
        key: 'name',
        render: (text, partition) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/datamart/audience/partitions/${partition.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messageMap.columnType,
        key: 'audience_partition_type',
        isHideable: false,
        render: (text, partition) => (
          <span>{partition.audience_partition_type}</span>
        ),
      },
      {
        intlMessage: messageMap.columnPartCount,
        key: 'part_count',
        render: (text, partition) => <span>{partition.part_count}</span>,
      },
      {
        intlMessage: messageMap.columnStatus,
        key: 'status',
        render: (text, partition) => <span>{partition.status}</span>,
      },
    ];

    const actionColumns: Array<
      ActionsColumnDefinition<AudiencePartitionResource>
    > = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messageMap.edit,
            callback: onEdit,
          },
          // waiting backend part
          // {
          //   intlMessage: messageMap.archive,
          //   callback: this.archivePartition,
          // },
        ],
      },
    ];

    return (
      <div className="mcs-table-container">
        <AudiencePartitionTable
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dataSource={audiencePartitions ? audiencePartitions.data : []}
          loading={fetchingPartitions}
          pagination={pagination}
          filtersOptions={this.getFiltersOptions()}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, AudiencePartitionsTableProps>(
  injectIntl,
  connect(mapStateToProps),
)(AudiencePartitionsTable);

const messageMap = defineMessages({
  columnName: {
    id: 'audience.partitions.table.column.name',
    defaultMessage: 'Name',
  },
  columnType: {
    id: 'audience.partitions.table.column.type',
    defaultMessage: 'Type',
  },
  columnPartCount: {
    id: 'audience.partitions.table.column.part_count',
    defaultMessage: 'Part Count',
  },
  columnStatus: {
    id: 'audience.partitions.table.column.status',
    defaultMessage: 'Status',
  },
  searchPlaceholder: {
    id: 'audience.partitions.search.placeholder',
    defaultMessage: 'Search Audience Partitions',
  },
  edit: {
    id: 'audience.partitions.table.action.edit',
    defaultMessage: 'Edit',
  },
});
