import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';

import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../../components/TableView';
import messages from './messages';
import { MobileApplicationResource } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';

export interface MobileApplicationsTableProps {
  isFetchingMobileApplications: boolean;
  dataSource: MobileApplicationResource[];
  totalMobileApplications: number;
  noMobileApplicationYet: boolean;
  onFilterChange: (a: Partial<Filter>) => void;
  onArchiveMobileApplication: (a: MobileApplicationResource) => void;
  onEditMobileApplication: (a: MobileApplicationResource) => void;
  filter: Filter;
}

type Props = MobileApplicationsTableProps & InjectedIntlProps;

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

    const actionColumns = [
      {
        key: 'action',
        actions: [
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
          name: value,
        }),
      defaultValue: filter.name,
    };

    return noMobileApplicationYet ? (
      <EmptyTableView
        iconType="display"
        intlMessage={messages.emptyMobileApplications}
      />
    ) : (
      <TableViewFilters
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        searchOptions={searchOptions}
        dataSource={dataSource}
        loading={isFetchingMobileApplications}
        pagination={pagination}
      />
    );
  }
}

export default injectIntl(MobileApplicationsTable);
