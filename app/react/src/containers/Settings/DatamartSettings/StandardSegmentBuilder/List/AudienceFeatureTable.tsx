import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { EmptyTableView, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { AudienceFeatureSearchSettings } from '../../../../../services/AudienceFeatureService';

export interface AudienceFeatureTableProps {
  isLoading: boolean;
  dataSource: AudienceFeatureResource[];
  total?: number;
  noItem: boolean;
  onFilterChange: (newFilter: Partial<Filter>) => void;
  filter?: AudienceFeatureSearchSettings;
  deleteAudienceFeature: (audienceFeature: AudienceFeatureResource) => void;
  relatedTable?: JSX.Element;
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
      relatedTable,
    } = this.props;

    const pagination = {
      current: filter?.currentPage || 1,
      pageSize: filter?.pageSize || 10,
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

    const dataColumns: Array<DataColumnDefinition<AudienceFeatureResource>> = [
      {
        title: 'ID',
        key: 'id',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.audienceFeatureName),
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
        title: formatMessage(messages.audienceFeatureDescription),
        key: 'description',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.audienceFeatureObjectTreeExpression),
        key: 'object_tree_expression',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => text,
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<AudienceFeatureResource>> = [
      {
        className: 'mcs-audienceFeatureTable_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            className: 'mcs-audienceFeatureTable_dropDownMenu--edit',
            message: formatMessage(messages.audienceFeatureEdit),
            callback: this.onEditAudienceFeature,
          },
          {
            className: 'mcs-audienceFeatureTable_dropDownMenu--delete',
            message: formatMessage(messages.audienceFeatureDelete),
            callback: deleteAudienceFeature,
          },
        ],
      },
    ];

    const searchOptions = {
      placeholder: formatMessage(messages.audienceFeatureSearchPlaceholder),
      onSearch: (value: string) =>
        onFilterChange({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter?.keywords,
    };

    return noItem && !isLoading ? (
      <EmptyTableView
        iconType='settings'
        message={formatMessage(messages.audienceFeatureEmptyList)}
        className='mcs-table-view-empty mcs-empty-card mcs-audienceFeature_table'
      />
    ) : (
      <TableViewFilters
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        searchOptions={searchOptions}
        dataSource={dataSource}
        loading={isLoading}
        pagination={pagination}
        relatedTable={relatedTable}
        className='mcs-audienceFeature_table'
      />
    );
  }
}

export default compose<Props, AudienceFeatureTableProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(AudienceFeatureTable);
