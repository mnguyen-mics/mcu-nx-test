import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from './messages';
import { ViewComponentWithFiltersProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-view-filters/TableViewFilters';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';

export type TableViewFiltersWithSelectionNotifyerMessagesProps<T> = Omit<
  ViewComponentWithFiltersProps<T>,
  'selectionNotifyerMessages'
>;

type Props<T> = TableViewFiltersWithSelectionNotifyerMessagesProps<T> & InjectedIntlProps;

class TableViewFiltersWithSelectionNotifyerMessages<T> extends React.Component<Props<T>> {
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
      <TableViewFilters {...tableViewProps} selectionNotifyerMessages={selectionNotifyerMessages} />
    );
  }
}

export default compose<Props<any>, TableViewFiltersWithSelectionNotifyerMessagesProps<any>>(
  injectIntl,
)(TableViewFiltersWithSelectionNotifyerMessages);
