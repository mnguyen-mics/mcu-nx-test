import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Menu, Table } from 'antd';

import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { SpinProps } from 'antd/lib/spin';
import { ClickParam } from 'antd/lib/menu';

import McsIcons from '../McsIcons';
import { isValidFormattedMessageProps } from '../../utils/IntlHelper';
import generateGuid from '../../utils/generateGuid';

const DEFAULT_PAGINATION_OPTION = {
  size: 'small',
  showSizeChanger: true,
};

interface DataColumnDefinition {
  intlMessage: FormattedMessage.Props;
  translationKey: string;
  key: string;
  render?: (text: string, record: object, index: number) => JSX.Element;
  sorter?: boolean | ((a: any, b: any) => number);
  isHideable?: boolean;
  isVisibleByDefault?: boolean;
}

interface ActionDefinition {
  translationKey?: string;
  intlMessage?: FormattedMessage.MessageDescriptor;
  callback: (record: object) => void;
}
interface ActionsColumnDefinition {
  key: string;
  actions: ActionDefinition[];
}

export interface VisibilitySelectedColumn {
  key: string;
  value: string;
}

export interface ColumnsDefinitions {
  dataColumnsDefinition: DataColumnDefinition[];
  actionsColumnsDefinition?: ActionsColumnDefinition[];
}

export interface TableViewProps {
  columnsDefinitions: ColumnsDefinitions;
  // TODO use generics T[]
  dataSource: object[];
  loading?: boolean | SpinProps;
  pagination?: PaginationProps | boolean;
  onChange?: (pagination: PaginationProps | boolean, filters: string[], sorter: object) => any;
  onRowClick: (id: string) => any;
  visibilitySelectedColumns: VisibilitySelectedColumn[];
}

interface TableViewState {
  visibilitySelectedColumns: [{
    key: string;
    value: string;
  }];
}

class TableView extends React.Component<TableViewProps, TableViewState> {

  static defaultProps: Partial<TableViewProps> = {
    pagination: false,
    visibilitySelectedColumns: [],
  };

  buildActionsColumns = (actionsColumnsDefinition: ActionsColumnDefinition[]) => {
    const actionColumns = actionsColumnsDefinition.map(column => {
      return {
        dataIndex: generateGuid(),
        key: generateGuid(),
        width: 30,
        render: (text: string, record: object) => {
          return (
            <Dropdown
              overlay={this.renderActionsMenu(column.actions, record)}
              trigger={['click']}
            >
              <a className="ant-dropdown-link">
                <McsIcons type="chevron" />
              </a>
            </Dropdown>
          );
        },
        sorter: false,
      };
    });

    return actionColumns;
  }

  buildDataColumns = () => {
    const {
      columnsDefinitions: { dataColumnsDefinition },
      visibilitySelectedColumns,
    } = this.props;

    const visibilitySelectedColumnsValues: string[] = visibilitySelectedColumns.map((column) => {
      return column.value;
    });

    const dataColumns = dataColumnsDefinition.filter(column => {
      if (visibilitySelectedColumnsValues.length >= 1) {
        return !column.isHideable || visibilitySelectedColumnsValues.includes(column.key);
      }
      return column;
    }).map(dataColumn => {
      // intlMessage shape is standard FormattedMessage props { id: '', defaultMessage: ''}
      const titleProps = (isValidFormattedMessageProps(dataColumn.intlMessage)
        ? { title: <FormattedMessage {...dataColumn.intlMessage} /> } // spreading values...
        : (dataColumn.translationKey
            ? { title: <FormattedMessage id={dataColumn.translationKey} /> } // support for legacy translation key constant (en/fr.json) ...
            : null
          )
      );

      return {
        ...titleProps, // allow empty column title
        dataIndex: dataColumn.key,
        key: dataColumn.key,
        render: dataColumn.render ? dataColumn.render : (text: any) => text,
        sorter: dataColumn.sorter ? dataColumn.sorter : false,
      };
    });

    return dataColumns;
  }

  renderActionsMenu(actions: ActionDefinition[], record: any) {
    const onClick = (item: ClickParam) => {
      actions[parseInt(item.key, 0)].callback(record);
    };

    return (
      <Menu onClick={onClick} className="mcs-dropdown-actions">
        {actions.map((action, index) => {
          return (
            <Menu.Item key={index.toString()}>
              <a>
                {
                  isValidFormattedMessageProps(action.intlMessage) ?
                    <FormattedMessage {...action.intlMessage!} /> :
                    <FormattedMessage id={action.translationKey!} />
                }
              </a>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }

  render() {
    const {
      columnsDefinitions,
      dataSource,
      loading,
      onChange,
      pagination,
    } = this.props;

    const actionsColumns = columnsDefinitions.actionsColumnsDefinition ? this.buildActionsColumns(
      columnsDefinitions.actionsColumnsDefinition,
    ) : [];

    const columns = columnsDefinitions.actionsColumnsDefinition ? this.buildDataColumns().concat(actionsColumns) : this.buildDataColumns();

    const dataSourceWithIds = dataSource.map(elem => ({ key: generateGuid(), ...elem }));

    let newPagination = pagination;
    if (pagination) {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
        ...pagination as PaginationProps,
      };
    }

    const onRowClick: (row: { id: string }) => any = ({ id }) => this.props.onRowClick(id);
    const rowClassName = () => 'mcs-table-cursor';

    return (
      <Table
        columns={columns}
        dataSource={dataSourceWithIds}
        loading={loading}
        onChange={onChange}
        onRowClick={onRowClick}
        pagination={newPagination}
        rowClassName={rowClassName}
      />
    );
  }
}

export default TableView;
