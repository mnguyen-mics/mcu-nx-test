import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import { StandardSegmentBuilderResource } from '../../../../../models/standardSegmentBuilder';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWithSelectionNotifyerMessages } from '../../../../../components/TableView';

export interface StandardSegmentBuilderTableProps {
  isLoading: boolean;
  dataSource: StandardSegmentBuilderResource[];
  total: number;
  noItem: boolean;
  onFilterChange: (newFilter: Partial<Filter>) => void;
  filter: Filter;
  deleteAudienceBuilder: (audienceBuilder: StandardSegmentBuilderResource) => void;
}

type Props = StandardSegmentBuilderTableProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; datamartId: string }>;

class StandardSegmentBuilderTable extends React.Component<Props> {
  onEditAudienceBuilder = (record: StandardSegmentBuilderResource) => {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      history,
    } = this.props;
    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/standard_segment_builder/${record.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
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
      filter,
      deleteAudienceBuilder,
    } = this.props;

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

    const dataColumns: Array<DataColumnDefinition<StandardSegmentBuilderResource>> = [
      {
        title: 'ID',
        key: 'id',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.audienceBuilderName),
        key: 'name',
        isHideable: false,
        render: (text: string, record: StandardSegmentBuilderResource) => {
          return (
            <Link
              to={{
                pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/standard_segment_builder/${record.id}/edit`,
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
    ];

    const actionColumns: Array<ActionsColumnDefinition<StandardSegmentBuilderResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.audienceBuilderEdit),
            callback: this.onEditAudienceBuilder,
          },
          {
            message: formatMessage(messages.audienceBuilderDelete),
            callback: deleteAudienceBuilder,
          },
        ],
      },
    ];

    return noItem && !isLoading ? (
      <EmptyTableView
        iconType='settings'
        message={formatMessage(messages.audienceBuilderEmptyList)}
        className='mcs-table-view-empty mcs-empty-card'
      />
    ) : (
      <TableViewWithSelectionNotifyerMessages
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={pagination}
      />
    );
  }
}

export default compose<Props, StandardSegmentBuilderTableProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(StandardSegmentBuilderTable);
