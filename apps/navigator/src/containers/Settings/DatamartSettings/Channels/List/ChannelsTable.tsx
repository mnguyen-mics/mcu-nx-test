import * as React from 'react';
import {
  ChannelResourceShape,
  ChannelResourceShapeWithAnalytics,
} from '../../../../../models/settings/settings';
import { ChannelFilter } from './domain';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { TablePaginationConfig } from 'antd/lib/table';
import messages from './messages';
import {
  Button,
  EmptyTableView,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import moment from 'moment';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { connect } from 'react-redux';
import { SearchProps } from 'antd/lib/input';
import { formatMetric } from '../../../../../utils/MetricHelper';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

export interface ChannelsTableProps {
  isFetchingChannels: boolean;
  dataSource: ChannelResourceShapeWithAnalytics[];
  totalChannels: number;
  noChannelYet: boolean;
  onFilterChange: (partialFilter: Partial<ChannelFilter>) => void;
  onDeleteChannel: (channel: ChannelResourceShape) => void;
  onEditChannel: (channel: ChannelResourceShape) => void;
  filter: ChannelFilter;
  filtersOptions: Array<MultiSelectProps<any>>;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = ChannelsTableProps &
  WrappedComponentProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class ChannelsTable extends React.Component<Props> {
  render() {
    const {
      isFetchingChannels,
      dataSource,
      totalChannels,
      noChannelYet,
      onFilterChange,
      onDeleteChannel,
      onEditChannel,
      filter,
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
      filtersOptions,
      workspace,
    } = this.props;

    const datamarts = workspace(organisationId).datamarts;

    const pagination: TablePaginationConfig = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalChannels,
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

    const dataColumns: Array<DataColumnDefinition<ChannelResourceShapeWithAnalytics>> = [
      {
        title: formatMessage(messages.channelId),
        key: 'id',
        isHideable: false,
      },
      {
        title: formatMessage(messages.channelName),
        key: 'name',
        isHideable: false,
        render: (text: string, record: ChannelResourceShapeWithAnalytics) => {
          const handleEditChannel = () => {
            onEditChannel(record);
          };

          return <Button onClick={handleEditChannel}>{text}</Button>;
        },
      },
      {
        title: formatMessage(messages.channelType),
        key: 'type',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        title: formatMessage(messages.channelToken),
        key: 'token',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        title: formatMessage(messages.lastSevenDaysActivities),
        key: 'activities',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: ChannelResourceShapeWithAnalytics) => {
          return formatMetric(record.sessions, '0,0');
        },
      },
      {
        title: formatMessage(messages.lastSevenDaysUsers),
        key: 'users',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: ChannelResourceShapeWithAnalytics) => {
          return formatMetric(record.users, '0,0');
        },
      },
      {
        title: formatMessage(messages.channelDatamartName),
        key: 'datamart_name',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: ChannelResourceShape) => {
          const datamart = datamarts.find(d => d.id === record.datamart_id);

          return datamart ? datamart.name : '';
        },
      },
      {
        title: formatMessage(messages.channelCreationDate),
        key: 'creation_ts',
        isVisibleByDefault: true,
        isHideable: true,
        render: (ts: string) => moment(ts).format('DD/MM/YYYY'),
      },
    ];

    const searchOptions: SearchProps = {
      placeholder: formatMessage(messages.searchPlaceholder),
      onSearch: (value: string) =>
        onFilterChange({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
      className: 'mcs-channelsTable_search_bar',
    };

    const actionColumns: Array<ActionsColumnDefinition<ChannelResourceShape>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.editChannel),
            callback: onEditChannel,
          },
          {
            message: formatMessage(messages.deleteChannel),
            callback: onDeleteChannel,
          },
        ],
      },
    ];

    return noChannelYet ? (
      <EmptyTableView
        iconType='settings'
        message={formatMessage(messages.emptyChannels)}
        className='mcs-table-view-empty mcs-empty-card'
      />
    ) : (
      <TableViewFilters
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSource}
        loading={isFetchingChannels}
        searchOptions={searchOptions}
        pagination={pagination}
        filtersOptions={filtersOptions}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, ChannelsTableProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
)(ChannelsTable);
