import React from 'react';
import { injectIntl } from 'react-intl';
import moment from 'moment';

import { EmptyTableView, TableView } from '../../../../components/TableView/index';
import { Label } from '../../../Labels/Labels';
import messages from './messages';

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

function LabelsTable(props: LabelsTableProps) {

    const {
      isFetchingLabels,
      dataSource,
      totalLabels,
      noLabelYet,
      onFilterChange,
      onLabelEdit,
      onLabelArchive,
      filter,
    } = props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalLabels,
      onChange: (page: number) => onFilterChange({
        currentPage: page,
      }),
      onShowSizeChange: (current: number, size: number) => onFilterChange({
        pageSize: size,
        currentPage: 1,
      }),
    };

    const dataColumns = [
      {
        intlMessage: messages.labelsName,
        key: 'name',
        isVisibleByDefault: true,
        isHideable: true,
      },
      {
        intlMessage: messages.labelsCreationDate,
        key: 'creation_ts',
        isVisibleByDefault: true,
        isHideable: false,
        render: (ts: string) => moment(ts).format('DD/MM/YYYY'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            intlMessage: messages.editLabel,
            callback: onLabelEdit,
          },
          {
            intlMessage: messages.archiveLabel,
            callback: onLabelArchive,
          },
        ],
      },
    ];


    return (noLabelYet) ? (
            <EmptyTableView
              iconType="full-users"
              intlMessage={messages.emptyLabels}
            />
          ) : (
            <TableView
              actionsColumnsDefinition={actionColumns}
              columns={dataColumns}
              dataSource={dataSource}
              loading={isFetchingLabels}
              pagination={pagination}
            />
           );
}

export default injectIntl(LabelsTable);
