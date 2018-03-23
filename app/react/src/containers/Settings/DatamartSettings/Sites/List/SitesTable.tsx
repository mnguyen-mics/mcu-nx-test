import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';

import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../../components/TableView';
import messages from './messages';
import { SiteResource } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';

export interface SitesTableProps {
  isFetchingSites: boolean;
  dataSource: SiteResource[];
  totalSites: number;
  noSiteYet: boolean;
  onFilterChange: (a: Partial<Filter>) => void;
  onArchiveSite: (a: SiteResource) => void;
  onEditSite: (a: SiteResource) => void;
  filter: Filter;
}

type Props = SitesTableProps & InjectedIntlProps;

class SitesTable extends React.Component<Props> {
  render() {
    const {
      isFetchingSites,
      dataSource,
      totalSites,
      noSiteYet,
      onFilterChange,
      onArchiveSite,
      onEditSite,
      filter,
      intl: { formatMessage },
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalSites,
      onChange: (page: number, size: number) =>
        onFilterChange({
          currentPage: page,
          pageSize: size
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messages.siteName,
        key: 'name',
        isHideable: false,
      },
      {
        intlMessage: messages.siteToken,
        key: 'token',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.siteCreationDate,
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
            intlMessage: messages.editSite,
            callback: onEditSite,
          },
          {
            intlMessage: messages.archiveSite,
            callback: onArchiveSite,
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

    return noSiteYet ? (
      <EmptyTableView iconType="bolt" intlMessage={messages.emptySites} />
    ) : (
      <TableViewFilters
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        searchOptions={searchOptions}
        dataSource={dataSource}
        loading={isFetchingSites}
        pagination={pagination}
      />
    );
  }
}

export default injectIntl(SitesTable);
