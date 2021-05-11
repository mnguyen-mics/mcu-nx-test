import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import { Label } from '../../../Labels/Labels';
import messages from './messages';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWithSelectionNotifyerMessages } from '../../../../components/TableView';

export interface Filters {
  currentPage?: number;
  pageSize?: number;
}

interface LabelsTableProps {
  isFetchingLabels: boolean;
  dataSource: Label[];
  totalLabels: number;
  noLabelYet: boolean;
  onFilterChange: (a: Filters) => void;
  onLabelEdit: (a: Label) => void;
  onLabelArchive: (a: Label) => void;
  filter: Filters;
}

function LabelsTable(props: LabelsTableProps & InjectedIntlProps) {
  const {
    isFetchingLabels,
    dataSource,
    totalLabels,
    noLabelYet,
    onFilterChange,
    onLabelEdit,
    onLabelArchive,
    filter,
    intl: { formatMessage },
  } = props;

  const pagination = {
    current: filter.currentPage,
    pageSize: filter.pageSize,
    total: totalLabels,
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

  const dataColumns: Array<DataColumnDefinition<Label>> = [
    {
      title: formatMessage(messages.labelsName),
      key: 'name',
      isVisibleByDefault: true,
      isHideable: true,
    },
    {
      title: formatMessage(messages.labelsCreationDate),
      key: 'creation_ts',
      isVisibleByDefault: true,
      isHideable: false,
      render: (ts: string) => moment(ts).format('DD/MM/YYYY'),
    },
  ];

  const actionColumns: Array<ActionsColumnDefinition<Label>> = [
    {
      key: 'action',
      actions: () => [
        {
          message: formatMessage(messages.editLabel),
          callback: onLabelEdit,
        },
        {
          message: formatMessage(messages.archiveLabel),
          callback: onLabelArchive,
        },
      ],
    },
  ];

  return noLabelYet ? (
    <EmptyTableView iconType='full-users' message={formatMessage(messages.emptyLabels)} />
  ) : (
    <TableViewWithSelectionNotifyerMessages
      actionsColumnsDefinition={actionColumns}
      columns={dataColumns}
      dataSource={dataSource}
      loading={isFetchingLabels}
      pagination={pagination}
    />
  );
}

export default injectIntl(LabelsTable);
