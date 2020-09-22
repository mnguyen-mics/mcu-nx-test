import * as React from 'react';
import Slide from '../Transition/Slide';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'antd';
import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { ExtendedTableRowSelection } from './TableView';

interface SelectionNotifyerProps<T> {
  rowSelection?: ExtendedTableRowSelection<T>;
  pagination?: PaginationProps | false;
}

class SelectionNotifyer extends React.Component<SelectionNotifyerProps<any>> {
  render() {
    const { rowSelection, pagination } = this.props;
    let content: JSX.Element = <span />;

    const handleOnClick = () => {
      if (rowSelection && rowSelection.selectAllItemIds) {
        rowSelection.selectAllItemIds();
      }
    };

    if (rowSelection && rowSelection.selectedRowKeys && pagination) {
      if (
        rowSelection.allRowsAreSelected ||
        rowSelection.selectedRowKeys.length === pagination.total
      ) {
        content = (
          <div>
            <FormattedMessage
              id="components.tableview.selectionNotifyer.allRowsSelected"
              defaultMessage={`All the {paginationTotal} items of this list have been selected. `}
              values={{
                paginationTotal: pagination.total,
              }}
            />
            <Button
              onClick={rowSelection.unselectAllItemIds}
              className="selected-rows-btn"
            >
              <FormattedMessage
                id="components.tableview.selectionNotifyer.unselectAll"
                defaultMessage={`Click here to unselect all the items.`}
              />
            </Button>
          </div>
        );
      } else if (rowSelection.selectedRowKeys.length === pagination.pageSize) {
        content = (
          <div>
            <FormattedMessage
              id="components.tableview.selectionNotifyer.allPageRowsSelected"
              defaultMessage={`You have selected {paginationPageSize} items. `}
              values={{
                paginationPageSize: pagination.pageSize,
              }}
            />
            <Button
              onClick={handleOnClick}
              className="selected-rows-btn"
            >
              <FormattedMessage
                id="components.tableview.selectionNotifyer.selectAll"
                defaultMessage={`Click here to select all the items.`}
              />
            </Button>
          </div>
        );
      } else {
        content = (
          <div>
            <FormattedMessage
              id="components.tableview.selectionNotifyer.selectedRows"
              defaultMessage={`You have selected {selectedRowKeysLength}
              { selectedRowKeysLength, plural, zero {item} one {item} other {items} }.`}
              values={{
                selectedRowKeysLength: rowSelection.selectedRowKeys.length,
              }}
            />
          </div>
        );
      }
    }

    const alert = (
      <Alert message={content} type="warning" className="selected-rows-alert" />
    );

    const toShow = !!(
      rowSelection &&
      rowSelection.selectedRowKeys &&
      pagination &&
      rowSelection.selectedRowKeys.length !== 0
    );

    return rowSelection && rowSelection.selectedRowKeys ? (
      <Slide toShow={toShow} content={alert} />
    ) : null;
  }
}

export default SelectionNotifyer;
