import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView';
import { messages } from '../messages';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

export interface AudienceFeatureTableProps {
  isLoading: boolean;
  dataSource: AudienceFeatureResource[];
  total: number;
  noItem: boolean;
  onFilterChange: (newFilter: Partial<Filter>) => void;
  filter: Filter;
  deleteAudienceFeature: (audienceFeature: AudienceFeatureResource) => void;
}

type Props = AudienceFeatureTableProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; datamartId: string }>;

class AudienceFeatureTable extends React.Component<Props> {
  onEditAudienceFeature = (record: AudienceFeatureResource) => {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      history,
    } = this.props;
    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_feature/${record.id}/edit`,
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
      deleteAudienceFeature,
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

    const dataColumns = [
      {
        title: 'ID',
        key: 'id',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: AudienceFeatureResource) => {
          return (
            <Link
              to={{
                pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_feature/${record.id}/edit`,
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
        intlMessage: messages.description,
        key: 'description',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.objectTreeExpression,
        key: 'object_tree_expression',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<
      AudienceFeatureResource
    >> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.edit,
            callback: this.onEditAudienceFeature,
          },
          {
            intlMessage: messages.delete,
            callback: deleteAudienceFeature,
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
        iconType="settings"
        message={formatMessage(messages.emptyList)}
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

export default compose<Props, AudienceFeatureTableProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(AudienceFeatureTable);
