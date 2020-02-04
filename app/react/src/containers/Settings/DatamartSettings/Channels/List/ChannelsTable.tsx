import * as React from 'react';
import { ChannelResourceShape } from '../../../../../models/settings/settings';
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

export interface ChannelsTableProps {
  isFetchingChannels: boolean;
  dataSource: ChannelResourceShape[];
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
      match: {
        params: { organisationId },
      },
      location,
      history,
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

    const dataColumns: Array<DataColumnDefinition<ChannelResourceShape>> = [
      {
        intlMessage: messages.channelName,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ChannelResourceShape) => {
          const handleEditChannel = () => {
            history.push({
              pathname: `/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/${record.type.toLowerCase}/${record.id}/edit`,
              state: { from: `${location.pathname}${location.search}` },
            });
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
