import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { EmptyTableView, TableView } from '../../../../components/TableView';
import messages from './messages';
import { Filter } from '../../Common/domain';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

export interface DatamartsTableProps {
  isFetchingDatamarts: boolean;
  dataSource: DatamartResource[];
  totalDatamarts: number;
  noDatamartYet: boolean;
  onFilterChange: (a: Partial<Filter>) => void;
  onArchiveDatamart?: (a: DatamartResource) => void;
  onEditDatamart: (a: DatamartResource) => void;
  filter: Filter;
}

type Props = DatamartsTableProps & InjectedIntlProps;

class DatamartsTable extends React.Component<Props> {
  render() {
    const {
      isFetchingDatamarts,
      dataSource,
      totalDatamarts,
      noDatamartYet,
      onFilterChange,
      onEditDatamart,
      filter,
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalDatamarts,
      onChange: (page: number) =>
        onFilterChange({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messages.datamartId,
        key: 'id',
        isHideable: false,
      },
      {
        intlMessage: messages.datamartToken,
        key: 'name',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            intlMessage: messages.editDatamart,
            callback: onEditDatamart,
          },
        ],
      },
    ];

    return noDatamartYet ? (
      <EmptyTableView
        iconType="full-users"
        intlMessage={messages.emptyDatamarts}
      />
    ) : (
      <TableView
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSource}
        loading={isFetchingDatamarts}
        pagination={pagination}
      />
    );
  }
}

export default injectIntl(DatamartsTable);
