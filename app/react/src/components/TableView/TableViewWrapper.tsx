import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from './messages';
import { TableViewProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableView } from '@mediarithmics-private/mcs-components-library';

const TableViewFromLibrary = TableView.TableView;

export type PartialTableViewProps<T> = Partial<TableViewProps<T>>;

type Props<T> = PartialTableViewProps<T> & InjectedIntlProps;

class TableViewWrapper<T> extends React.Component<Props<T>> {
  render() {
    const {
      intl: { formatMessage },
      ...tableViewProps
    } = this.props;

    const selectionNotifyerMessages = {
      allRowsSelected: formatMessage(messages.allRowsSelected),
      unselectAll: formatMessage(messages.unselectAll),
      allPageRowsSelected: formatMessage(messages.allPageRowsSelected),
      selectAll: formatMessage(messages.selectAll),
      selectedRows: formatMessage(messages.selectedRows),
    };

    return (
      <TableViewFromLibrary
        {...tableViewProps}
        selectionNotifyerMessages={selectionNotifyerMessages}
      />
    );
  }
}

export default compose<Props<any>, PartialTableViewProps<any>>(injectIntl)(TableViewWrapper);
