import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../../components/TableView';
import messages from './messages';
import { ChannelResource } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { Button } from '@mediarithmics-private/mcs-components-library';

export interface MobileApplicationsTableProps {
  isFetchingMobileApplications: boolean;
  dataSource: ChannelResource[];
  totalMobileApplications: number;
  noMobileApplicationYet: boolean;
  onFilterChange: (a: Partial<Filter>) => void;
  onArchiveMobileApplication: (a: ChannelResource) => void;
  onEditMobileApplication: (a: ChannelResource) => void;
  filter: Filter;
  filtersOptions?: Array<MultiSelectProps<any>>;
}

type Props = MobileApplicationsTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class MobileApplicationsTable extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      filter,
      totalMobileApplications,
      onFilterChange,
      onEditMobileApplication,
      onArchiveMobileApplication,
      noMobileApplicationYet,
      isFetchingMobileApplications,
      dataSource,
      match: {
        params: { organisationId },
      },
      location,
      history,
      filtersOptions
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalMobileApplications,
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
        intlMessage: messages.mobileApplicationName,
        key: 'name',
        isHideable: false,
        render: (text: string, record: ChannelResource) => {

          const handleEditSite = () => {
            history.push({
              pathname: `/v2/o/${organisationId}/settings/datamart/${record.datamart_id}/mobile_application/${record.id}/edit`,
              state: { from: `${location.pathname}${location.search}` }
            });
          }

          return (
            <Button onClick={handleEditSite}>
              {text}
            </Button>
          )
        },
      },
      {
        intlMessage: messages.mobileApplicationToken,
        key: 'token',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.mobileApplicationCreationDate,
        key: 'creation_ts',
        isVisibleByDefault: true,
        isHideable: true,
        render: (ts: string) => moment(ts).format('DD/MM/YYYY'),
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<ChannelResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editMobileApplication,
            callback: onEditMobileApplication,
          },
          {
            intlMessage: messages.archiveMobileApplication,
            callback: onArchiveMobileApplication,
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

    return noMobileApplicationYet ? (
      <EmptyTableView
        iconType="settings"
        intlMessage={messages.emptyMobileApplications}
        className="mcs-table-view-empty mcs-empty-card"
      />
    ) : (
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dataSource={dataSource}
          loading={isFetchingMobileApplications}
          pagination={pagination}
          filtersOptions={filtersOptions}
        />
      );
  }
}

export default compose<Props, MobileApplicationsTableProps>(
  injectIntl,
  withRouter,
)(MobileApplicationsTable);
