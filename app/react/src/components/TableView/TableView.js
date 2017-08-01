import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Menu, Table } from 'antd';

import { McsIcons } from '../McsIcons';

import { isValidFormattedMessageProps } from '../../utils/IntlHelper';

const DEFAULT_PAGINATION_OPTION = {
  size: 'small',
  showSizeChanger: true
};

class TableView extends Component {
  constructor(props) {
    super(props);
    this.buildDataColumns = this.buildDataColumns.bind(this);
    this.buildActionsColumns = this.buildActionsColumns.bind(this);
  }

  render() {
    const {
      columnsDefinitions,
      dataSource,
      pagination,
      loading,
      onChange
    } = this.props;

    const actionsColumns = this.buildActionsColumns(
      columnsDefinitions.actionsColumnsDefinition
    );

    const columns = this.buildDataColumns().concat(actionsColumns);

    let newPagination = pagination;
    if (pagination) {
      newPagination = {
        ...DEFAULT_PAGINATION_OPTION,
        ...pagination
      };
    }

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        onChange={onChange}
        loading={loading}
        pagination={newPagination}
      />
    );
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

  buildDataColumns() {
    const { columnsDefinitions: { dataColumnsDefinition } } = this.props;

    const dataColumns = dataColumnsDefinition.map(dataColumn => {
      return Object.assign(
        {},
        isValidFormattedMessageProps(dataColumn.intlMessage)
          ? // intlMessage shape is standard FormattedMessage props { id: '', defaultMessage: ''}
            // spreading values...
            { title: <FormattedMessage {...dataColumn.intlMessage} /> }
          : dataColumn.translationKey
              ? // support for legacy translation key constant (en/fr.json) ...
                { title: <FormattedMessage id={dataColumn.translationKey} /> }
              : null, // allow empty column title
        { dataIndex: dataColumn.key },
        { key: dataColumn.key },
        { render: dataColumn.render ? dataColumn.render : text => text },
        { sorter: dataColumn.sorter ? dataColumn.sorter : false }
      );
    });

    return dataColumns;
  }

  buildActionsColumns(defaultActionsColumns) {
    const actionColumns = defaultActionsColumns.map(column => {
      return {
        key: column.key,
        width: 30,
        render: (text, record) => {
          return (<Dropdown overlay={this.renderActionsMenu(column.actions, record)} trigger={['click']}>
            <a className="ant-dropdown-link">
              <McsIcons type="chevron" />
            </a>
          </Dropdown>);
        }
      };
    });

    return actionColumns;
  }
}

TableView.defaultProps = {
  pagination: false,
  onChange: () => {}
};

TableView.propTypes = {
  columnsDefinitions: PropTypes.shape({
    dataColumnsDefinition: PropTypes.array,
    actionsColumnsDefinition: PropTypes.array
  }).isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func
};

export default TableView;
