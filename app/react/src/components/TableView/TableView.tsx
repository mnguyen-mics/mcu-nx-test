import * as React from 'react';
import cuid from 'cuid';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Menu, Table } from 'antd';
import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { ClickParam } from 'antd/lib/menu';
import { TableProps, ColumnProps } from 'antd/lib/table';

import McsIcon from '../McsIcon';
import withTranslations, {
  TranslationProps,
} from '../../containers/Helpers/withTranslations';

const DEFAULT_PAGINATION_OPTION = {
  size: 'small',
  showSizeChanger: true,
};

export interface DataColumnDefinition<T> extends ColumnProps<T> {
  intlMessage?: FormattedMessage.MessageDescriptor;
  translationKey?: string;
  key: string;
  render?: (text: string, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: any, b: any) => number);
  isHideable?: boolean;
  isVisibleByDefault?: boolean;
}

export interface ActionDefinition<T> {
  translationKey?: string;
  intlMessage?: FormattedMessage.MessageDescriptor;
  callback: (record: T) => void;
}

export interface ActionsColumnDefinition<T> extends ColumnProps<T> {
  key: string;
  actions: Array<ActionDefinition<T>>;
}

export interface TableViewProps<T> extends TableProps<T> {
  columns?: Array<DataColumnDefinition<T>>;
  visibilitySelectedColumns?: Array<DataColumnDefinition<T>>;
  actionsColumnsDefinition?: Array<ActionsColumnDefinition<T>>;
}

class TableView<T> extends React.Component<
  TableViewProps<T> & TranslationProps
> {
  static defaultProps: Partial<TableViewProps<any>> = {
    pagination: false,
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
          title: dataColumn.intlMessage ? (
            <FormattedMessage {...dataColumn.intlMessage} />
          ) : dataColumn.translationKey ? (
            this.props.translations[dataColumn.translationKey]
          ) : (
            undefined
          ),
          dataIndex: dataColumn.key,
          key: dataColumn.key,
          render: dataColumn.render ? dataColumn.render : (text: any) => text,
          sorter: dataColumn.sorter ? dataColumn.sorter : false,
        };
      });
  };

  renderActionsMenu = (actions: Array<ActionDefinition<T>>, record: T) => {
    const onClick = (item: ClickParam) => {
      actions[parseInt(item.key, 0)].callback(record);
    };

    return (
      <Menu onClick={onClick} className="mcs-dropdown-actions">
        {actions.map((action, index) => {
          return (
            <Menu.Item key={index.toString()}>
              <a>
                {action.intlMessage ? (
                  <FormattedMessage {...action.intlMessage!} />
                ) : action.translationKey ? (
                  this.props.translations[action.translationKey]
                ) : (
                  index
                )}
              </a>
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
      translations,
      children,
      ...rest
    } = this.props;

    const columns: Array<ColumnProps<T>> = this.buildDataColumns().concat(
      this.buildActionsColumns(actionsColumnsDefinition!),
    );

    if (dataSource === undefined)
      throw new Error('Undefined dataSource in TableView');


    const dataSourceWithIds = dataSource.map((elem: T) => {
      return { ...(elem as any), key: cuid() };
    });

    let newPagination = pagination;
    if (pagination) {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
        ...(pagination as PaginationProps),
      };
    }

    const computedTableProps: TableProps<T> = {
      ...rest,
      columns,
      dataSource: dataSourceWithIds,
      loading,
      onChange,
      pagination: newPagination,
      rowClassName: () => 'mcs-table-cursor',
    };

    return <Table {...computedTableProps} />;
  }
}

export default withTranslations(TableView) as React.ComponentClass<
  TableViewProps<any>
>;
