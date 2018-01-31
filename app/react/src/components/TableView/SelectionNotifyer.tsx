import * as React from 'react';
import Slide from '../Transition/Slide';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'antd';
import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { TableRowSelection } from 'antd/lib/table';
import { ButtonStyleless } from '../index';

interface SelectionNotifyerProps<T> {
  rowSelection?: TableRowSelection<T> & {
    unselectAllItemIds?: () => void;
    selectAllItemIds?: (selected: boolean) => void;
  };
  pagination?: PaginationProps | false;
}

class SelectionNotifyer extends React.Component<SelectionNotifyerProps<any>> {
  render() {
    const { rowSelection, pagination } = this.props;
    let content: JSX.Element = <span />;

    const handleOnClick = () => {
      if (rowSelection && rowSelection.selectAllItemIds) {
        rowSelection.selectAllItemIds(true);
      }
    };

    if (rowSelection && rowSelection.selectedRowKeys && pagination) {
      if (rowSelection.selectedRowKeys.length === pagination.total) {
        content = (
          <div>
            <FormattedMessage
              id="display.items.allSelectedRows.msg"
              defaultMessage={`All the {paginationTotal} items of this list have been selected. `}
              values={{
                paginationTotal: pagination.total,
              }}
            />
            <ButtonStyleless
              onClick={rowSelection.unselectAllItemIds}
              className="selected-rows-btn"
            >
              <FormattedMessage
                id="display.items.unselectall.buttonText"
                defaultMessage={`Click here to unselect all the items.`}
              />
            </ButtonStyleless>
          </div>
        );
      } else if (rowSelection.selectedRowKeys.length === pagination.pageSize) {
        content = (
          <div>
            <FormattedMessage
              id="display.items.selectedPageRows.msg"
              defaultMessage={`You have selected {paginationPageSize} items. `}
              values={{
                paginationPageSize: pagination.pageSize,
              }}
            />
            <ButtonStyleless
              onClick={handleOnClick}
              className="selected-rows-btn"
            >
              <FormattedMessage
                id="display.items.selectall.buttonText"
                defaultMessage={`Click here to select all the items.`}
              />
            </ButtonStyleless>
          </div>
        );
      } else {
        content = <div />;
      }
    }

    const alert = (
      <Alert message={content} type="warning" className="selected-rows-alert" />
    );

    const toShow = !!(
      rowSelection &&
      rowSelection.selectedRowKeys &&
      pagination &&
      rowSelection.selectedRowKeys.length !== 0 &&
      (rowSelection.selectedRowKeys.length === pagination.total ||
        rowSelection.selectedRowKeys.length === pagination.pageSize)
    );

    return rowSelection && rowSelection.selectedRowKeys ? (
      <Slide toShow={toShow} content={alert} />
    ) : null;
  }
}

export default SelectionNotifyer;
