import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Menu, Table } from 'antd';

import McsIcons from '../McsIcons';
import { isValidFormattedMessageProps } from '../../utils/IntlHelper';
import generateGuid from '../../utils/generateGuid';

const DEFAULT_PAGINATION_OPTION = {
  size: 'small',
  showSizeChanger: true,
};

class TableView extends Component {

  buildActionsColumns = (defaultActionsColumns) => {
    const actionColumns = defaultActionsColumns.map(column => {
      return {
        key: generateGuid(),
        width: 30,
        render: (text, record) => {
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
      };
    });

    return actionColumns;
  }

  buildDataColumns = () => {
    const {
      columnsDefinitions: { dataColumnsDefinition },
      visibilitySelectedColumns,
    } = this.props;

    const visibilitySelectedColumnsValues = [];
    visibilitySelectedColumns.forEach((el) => {
      visibilitySelectedColumnsValues.push(el.value);
    });
    const dataColumns = dataColumnsDefinition.filter(column => !column.isHideable || visibilitySelectedColumnsValues.includes(column.key)).map(dataColumn => {
      return Object.assign(
        {},
        { title: (isValidFormattedMessageProps(dataColumn.intlMessage)
          ? <FormattedMessage {...dataColumn.intlMessage} />
          : (dataColumn.translationKey // support for legacy translation key constant (en/fr.json) ...
            ? <FormattedMessage id={dataColumn.translationKey} />
            : null
          )
        ) },
        { dataIndex: dataColumn.key },
        { key: dataColumn.key },
        { render: dataColumn.render ? dataColumn.render : text => text },
        { sorter: dataColumn.sorter ? dataColumn.sorter : false },
      );
    });

    return dataColumns;
  }

  columnSorter(a, b, key) {
    if (a[key] === '-' && b[key] === '-') {
      return 0;
    }
    if (a[key] === '-') {
      return 0 - b[key];
    }
    if (b[key] === '-') {
      return a[key] - 0;
    }
    return a[key] - b[key];
  }

  renderActionsMenu(actions, record) {
    const onClick = item => {
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
                    <FormattedMessage {...action.intlMessage} /> :
                    <FormattedMessage id={action.translationKey} />
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
      dataSource,
      pagination,
      loading,
      onChange,
      columnsDefinitions,
    } = this.props;

    const actionsColumns = columnsDefinitions.actionsColumnsDefinition ? this.buildActionsColumns(
      columnsDefinitions.actionsColumnsDefinition,
    ) : null;

    const columns = columnsDefinitions.actionsColumnsDefinition ? this.buildDataColumns().concat(actionsColumns) : this.buildDataColumns();
    const dataSourceWithIds = dataSource.map(elem => ({ key: generateGuid(), ...elem }));

    let newPagination = pagination;
    if (pagination) {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
        ...pagination,
      };
    }

    return (
      <Table
        columns={columns}
        dataSource={dataSourceWithIds}
        onChange={onChange}
        loading={loading}
        pagination={newPagination}
      />
    );
  }
}

TableView.defaultProps = {
  pagination: false,
  onChange: () => {},
  visibilitySelectedColumns: [],
};

TableView.propTypes = {
  columnsDefinitions: PropTypes.shape({
    dataColumnsDefinition: PropTypes.array,
    actionsColumnsDefinition: PropTypes.array,
  }).isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
  visibilitySelectedColumns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

export default TableView;
