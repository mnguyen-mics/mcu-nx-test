import * as React from 'react';
import { ChannelResourceShape, ChannelResourceShapeWithAnalytics } from '../../../../../models/settings/settings';
import { ChannelFilter } from './domain';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { PaginationConfig } from 'antd/lib/table';
import {
  DataColumnDefinition,
  ActionsColumnDefinition,
} from '../../../../../components/TableView/TableView';
import messages from './messages';
import { ButtonStyleless } from '../../../../../components';
import moment from 'moment';
import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../../components/TableView';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../../state/Session/selectors';
import { connect } from 'react-redux';
import { SearchProps } from 'antd/lib/input';

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
  InjectedIntlProps &
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

    const pagination: PaginationConfig = {
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
        intlMessage: messages.channelName,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ChannelResourceShapeWithAnalytics) => {
          const handleEditChannel = () => {
            onEditChannel(record);
          };

          return (
            <ButtonStyleless onClick={handleEditChannel}>
              {text}
            </ButtonStyleless>
          );
        },
      },
      {
        intlMessage: messages.channelType,
        key: 'type',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.channelToken,
        key: 'token',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.lastSevenDaysSessions,
        key: 'sessions',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.lastSevenDaysUsers,
        key: 'users',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.channelDatamartName,
        key: 'datamart_name',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: ChannelResourceShape) => {
          const datamart = datamarts.find(d => d.id === record.datamart_id);

          return datamart ? `${datamart.name} (id: ${record.datamart_id})` : '';
        },
      },
      {
        intlMessage: messages.channelCreationDate,
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
        }),
      defaultValue: filter.keywords,
    };

    const actionColumns: Array<ActionsColumnDefinition<
      ChannelResourceShape
    >> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editChannel,
            callback: onEditChannel,
          },
          {
            intlMessage: messages.deleteChannel,
            callback: onDeleteChannel,
          },
        ],
      },
    ];

    return noChannelYet ? (
      <EmptyTableView
        iconType="settings"
        intlMessage={messages.emptyChannels}
        className="mcs-table-view-empty mcs-empty-card"
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
