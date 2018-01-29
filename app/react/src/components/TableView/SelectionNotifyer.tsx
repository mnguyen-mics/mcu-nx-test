import * as React from 'react';
import Slide from '../Transition/Slide';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'antd';
import { PaginationProps } from 'antd/lib/pagination/Pagination';

interface SelectionNotifyerProps {
  rowSelection?: {
    selectedRowKeys: string[];
    unselectAllItemIds: () => void;
    selectAllItemIds: (selected: boolean) => void;
  };
  pagination?: PaginationProps | false;
}

class SelectionNotifyer extends React.Component<SelectionNotifyerProps> {
  render() {
    const { rowSelection, pagination } = this.props;
    let content: JSX.Element = <span />;

    const handleOnClick = () => {
      if (rowSelection) {
        rowSelection.selectAllItemIds(true);
      }
    };

    if (rowSelection && pagination) {
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
            <Button onClick={rowSelection.unselectAllItemIds}>
              <FormattedMessage
                id="display.items.unselectall.buttonText"
                defaultMessage={`Click here to unselect all the items.`}
              />
            </Button>
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
            <Button onClick={handleOnClick}>
              <FormattedMessage
                id="display.items.selectall.buttonText"
                defaultMessage={`Click here to select all the items.`}
              />
            </Button>
          </div>
        );
      }
    }

    const alert = <Alert message={content} type="warning" />;

    const toShow = !!(
      rowSelection &&
      pagination &&
      rowSelection.selectedRowKeys.length !== 0 &&
      (rowSelection.selectedRowKeys.length === pagination.total ||
        rowSelection.selectedRowKeys.length === pagination.pageSize)
    );

    return (
      rowSelection &&
      rowSelection.selectedRowKeys && <Slide toShow={toShow} content={alert} />
    );
  }
}

export default SelectionNotifyer;
