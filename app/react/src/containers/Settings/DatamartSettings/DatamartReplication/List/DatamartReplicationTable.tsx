import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import messages from './messages';
import { DatamartReplicationResourceShape } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { DATAMART_REPLICATION_SEARCH_SETTINGS } from './DatamartReplicationListContainer';
import { Modal, Switch, Tooltip } from 'antd';
import {
  EmptyTableView,
  McsIcon,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

export interface DatamartReplicationTableProps {
  isLoading: boolean;
  dataSource: DatamartReplicationResourceShape[];
  total: number;
  noItem: boolean;
  onFilterChange: (newFilter: Partial<Filter>) => void;
  deleteReplication: (resource: DatamartReplicationResourceShape) => void;
  updateReplication: (resource: DatamartReplicationResourceShape, status: boolean) => void;
  lastExecutionIsRunning: boolean;
}

type Props = DatamartReplicationTableProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string; datamartId: string }>;

class DatamartReplicationTable extends React.Component<Props> {
  handleModal = (record: DatamartReplicationResourceShape) => {
    const { intl } = this.props;
    Modal.info({
      title: intl.formatMessage(messages.replicationProperties),
      okText: 'Ok',
      width: '650px',
      content: (
        <SyntaxHighlighter language='json' style={docco}>
          {JSON.stringify(record, undefined, 4)}
        </SyntaxHighlighter>
      ),
    });
  };

  onEditDatamartReplication = (record: DatamartReplicationResourceShape) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/datamart_replication/${record.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  onDeleteDatamartReplication = (replication: DatamartReplicationResourceShape) => {
    const { deleteReplication } = this.props;
    deleteReplication(replication);
  };

  updateReplicationStatus = (replication: DatamartReplicationResourceShape, status: boolean) => {
    const { updateReplication } = this.props;
    updateReplication(replication, status);
  };

  render() {
    const {
      intl: { formatMessage },
      total,
      onFilterChange,
      noItem,
      isLoading,
      dataSource,
      match: {
        params: { organisationId, datamartId },
      },
      location: { search },
      lastExecutionIsRunning,
    } = this.props;
    const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage || 1,
      pageSize: filter.pageSize || 10,
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

    const dataColumns: Array<DataColumnDefinition<DatamartReplicationResourceShape>> = [
      {
        title: 'ID',
        key: 'id',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.datamartReplicationStatus),
        key: 'status',
        isHideable: false,
        render: (text: string, record: DatamartReplicationResourceShape) => {
          const onChange = (checked: boolean) => {
            return text !== 'ERROR' && this.updateReplicationStatus(record, checked);
          };
          return (
            <Tooltip
              placement='top'
              title={lastExecutionIsRunning ? formatMessage(messages.jobIsRunning) : record.status}
            >
              <Switch
                className='mcs-table-switch'
                checked={text === 'ACTIVE'}
                disabled={text === 'ERROR' || lastExecutionIsRunning}
                onChange={onChange}
                checkedChildren={<McsIcon style={{ verticalAlign: 'middle' }} type='play' />}
                unCheckedChildren={<McsIcon style={{ verticalAlign: 'middle' }} type='pause' />}
              />
              {text === 'ERROR' && <McsIcon className={'font-error status-error'} type={'close'} />}
            </Tooltip>
          );
        },
      },
      {
        title: formatMessage(messages.datamartReplicationName),
        key: 'name',
        isHideable: false,
        render: (text: string, record: DatamartReplicationResourceShape) => {
          return (
            <Link
              className='mcs-datamartSettings_datamartReplicationTableItem'
              to={{
                pathname: `/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/datamart_replication/${record.id}/edit`,
                state: {
                  datamartId: datamartId,
                },
              }}
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: formatMessage(messages.datamartReplicationType),
        key: 'type',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<DatamartReplicationResourceShape>> = [
      {
        className: 'mcs-datamartReplicationTable_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            className: 'mcs-datamartReplicationTable_dropDownMenu--edit',
            message: formatMessage(messages.editDatamartReplication),
            callback: this.onEditDatamartReplication,
          },
          {
            className: 'mcs-datamartReplicationTable_dropDownMenu--delete',
            message: formatMessage(messages.deleteDatamartReplication),
            callback: this.onDeleteDatamartReplication,
          },
          {
            className: 'mcs-datamartReplicationTable_dropDownMenu--seeReplicationProperties',
            message: formatMessage(messages.seeReplicationProperties),
            callback: this.handleModal,
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

    return noItem && !isLoading ? (
      <EmptyTableView
        iconType='settings'
        message={formatMessage(messages.emptyDatamartReplicationList)}
        className='mcs-table-view-empty mcs-empty-card'
      />
    ) : (
      <TableViewFilters
        className='mcs-datamartReplicationTable'
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
