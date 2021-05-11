import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from './messages';
import { TableViewProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableView } from '@mediarithmics-private/mcs-components-library';

type Props<T> = TableViewProps<T> & InjectedIntlProps;

class TableViewWithSelectionNotifyerMessages<T> extends React.Component<Props<T>> {
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
      <TableView.TableView
        {...tableViewProps}
        selectionNotifyerMessages={selectionNotifyerMessages}
      />
    );
  }
}

export default compose<Props<any>, TableViewProps<any>>(injectIntl)(
  TableViewWithSelectionNotifyerMessages,
);
