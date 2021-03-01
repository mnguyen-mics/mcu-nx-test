import * as React from 'react';
import cuid from 'cuid';
import { compose } from 'recompose';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { Menu, Table } from 'antd';
import { TableProps, ColumnProps } from 'antd/lib/table';
import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { Dropdown } from '../../components/PopupContainers';
import SelectionNotifier from './SelectionNotifier';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { TablePaginationConfig, TableRowSelection } from 'antd/lib/table/interface';

const DEFAULT_PAGINATION_OPTION = {
  size: 'small' as 'small',
  showSizeChanger: true,
};

export interface DataColumnDefinition<T> extends ColumnProps<T> {
  intlMessage?: FormattedMessage.MessageDescriptor;
  key: string;
  render?: (text: string, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: any, b: any) => number);
  isHideable?: boolean;
  isVisibleByDefault?: boolean;
}

export interface ActionDefinition<T> {
  intlMessage?: FormattedMessage.MessageDescriptor;
  disabled?: boolean;
  callback: (record: T) => void;
}

export type ActionsRenderer<T> = (record: T) => Array<ActionDefinition<T>>;

export interface ActionsColumnDefinition<T> extends ColumnProps<T> {
  key: string;
  actions: ActionsRenderer<T>;
}

export interface ExtendedTableRowSelection<T = any>
  extends TableRowSelection<T> {
  selectedRowKeys?: string[];
  allRowsAreSelected?: boolean;
  selectAllItemIds?: () => void;
  unselectAllItemIds?: () => void;
  onSelect?: () => void;
}

export interface TableViewProps<T> extends TableProps<T> {
  columns?: Array<DataColumnDefinition<T>>;
  visibilitySelectedColumns?: Array<DataColumnDefinition<T>>;
  actionsColumnsDefinition?: Array<ActionsColumnDefinition<T>>;
  rowSelection?: ExtendedTableRowSelection;
}

class TableView<
  T extends { key?: string; id?: string; [key: string]: any }
> extends React.Component<TableViewProps<T> & InjectedIntlProps> {
  static defaultProps: Partial<TableViewProps<any>> = {
    visibilitySelectedColumns: [],
    actionsColumnsDefinition: [],
  };

  buildActionsColumns = (
    actionsColumnsDefinition: Array<ActionsColumnDefinition<T>>,
  ): Array<ColumnProps<T>> => {
    return actionsColumnsDefinition.map(column => ({
      key: column.key,
      width: 30,
      render: (text: string, record: T) => {
        return (
          <Dropdown
            overlay={this.renderActionsMenu(column.actions, record)}
            trigger={['click']}
            className={`mcs-tableActions_dropdown`}
          >
            <a className="ant-dropdown-link">
              <McsIcon type="chevron" />
            </a>
          </Dropdown>
        );
      },
      sorter: false,
    }));
  };

  buildDataColumns = (): Array<ColumnProps<T>> => {
    const { columns, visibilitySelectedColumns } = this.props;

    const isMessagDescriptor = (
      dataTitle?: FormattedMessage.MessageDescriptor | React.ReactNode,
    ): dataTitle is FormattedMessage.MessageDescriptor => {
      const dt = (dataTitle as FormattedMessage.MessageDescriptor);
      return dt && dt.id !== undefined;
    };

    const visibilitySelectedColumnsValues: string[] = visibilitySelectedColumns!.map(
      column => {
        return column.key;
      },
    );

    if (columns === undefined)
      throw new Error('Undefined columns in TableView');

    return columns
      .filter(column => {
        if (visibilitySelectedColumnsValues.length >= 1) {
          return (
            !column.isHideable ||
            visibilitySelectedColumnsValues.includes(column.key)
          );
        }
        return column;
      })
      .map(dataColumn => {
        return {
          title: isMessagDescriptor(dataColumn.intlMessage) ? (
            <FormattedMessage {...dataColumn.intlMessage} />
          ) : (
            dataColumn.title
          ),
          dataIndex: dataColumn.key,
          key: dataColumn.key,
          render: dataColumn.render ? dataColumn.render : (text: any) => text,
          sorter: dataColumn.sorter ? dataColumn.sorter : false,
        };
      });
  };

  renderActionsMenu = (
    actions: (record: T) => Array<ActionDefinition<T>>,
    record: T,
  ) => {
    const onClick = (item: any) => {
      actions(record)[parseInt(item.key, 0)].callback(record);
    };

    return (
      <Menu onClick={onClick} className="mcs-dropdown-actions">
        {actions(record).map((action, index) => {
          return (
            <Menu.Item key={index.toString()} disabled={action.disabled} className={action.intlMessage ? `mcs-tableActions_${action.intlMessage?.id}` : ''}>
              {action.intlMessage ? (
                <FormattedMessage {...action.intlMessage!} />
              ) : (
                index
              )}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };

  render() {
    const {
      dataSource,
      loading,
      onChange,
      pagination,
      actionsColumnsDefinition,
      visibilitySelectedColumns,
      children,
      intl,
      ...rest
    } = this.props;

    const columns: Array<ColumnProps<T>> = this.buildDataColumns().concat(
      this.buildActionsColumns(actionsColumnsDefinition!),
    );

    if (dataSource === undefined)
      throw new Error('Undefined dataSource in TableView');

    const dataSourceWithIds = dataSource.map(elem => ({
      key: elem.id ? elem.id : cuid(),
      ...(elem as any),
    }));

    let newPagination: false | TablePaginationConfig | undefined = pagination;
    if (pagination) {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
        ...(pagination as PaginationProps),
      };
    } else {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
      };
    }

    const computedTableProps: TableProps<T> = {
      ...rest,
      columns,
      dataSource: dataSourceWithIds,
      loading,
      onChange,
      pagination: newPagination,
    };

    return (
      <div style={{width: "100%"}}>
        <SelectionNotifier
          rowSelection={rest.rowSelection}
          pagination={pagination}
        />

        <Table {...computedTableProps} />
      </div>
    );
  }
}

export default compose(injectIntl)(TableView) as React.ComponentClass<
  TableViewProps<any>
>;
