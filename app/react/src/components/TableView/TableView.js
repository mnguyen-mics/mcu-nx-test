import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Icon, Menu, Row, Col, Table, Input, DatePicker } from 'antd';

import { MultiSelect } from '../Forms';

const Search = Input.Search;
const { RangePicker } = DatePicker;

const DEFAULT_RANGE_PICKER_DATE_FORMAT = 'DD/MM/YYYY';

const DEFAULT_PAGINATION = {
  size: 'small',
  showSizeChanger: true
};

class TableView extends Component {

  constructor(props) {
    super(props);
    this.getHiddableColumns = this.getHiddableColumns.bind(this);
    this.buildDataColumns = this.buildDataColumns.bind(this);
    this.buildActionsColumns = this.buildActionsColumns.bind(this);
    this.changeColumnVisibility = this.changeColumnVisibility.bind(this);
    this.state = {
      visibilitySelectedColumns: this.getHiddableColumns().filter(column => column.isVisibleByDefault).map(column => ({ key: column.translationKey, value: column.key }))
    };
  }

  getHiddableColumns() {
    const {
      columnsDefinitions: {
        dataColumnsDefinition
      }
    } = this.props;
    return dataColumnsDefinition.filter(column => column.isHiddable);
  }

  render() {
    const {
      columnsDefinitions,
      dataSource,
      searchOptions,
      dateRangePickerOptions,
      pagination,
      loading,
      onChange,
      filtersOptions,
      columnsVisibilityOptions
    } = this.props;

    const {
      visibilitySelectedColumns
    } = this.state;

    const extendedPagination = {
      ...DEFAULT_PAGINATION,
      ...pagination
    };

    const actionsColumns = this.buildActionsColumns(columnsDefinitions.actionsColumnsDefinition);

    const columns = this.buildDataColumns().concat(actionsColumns);

    const searchInput = searchOptions.isEnabled ?
    (<Col span={6}>
      <Search
        placeholder={searchOptions.placeholder}
        className="mcs-search-input"
        defaultValue={searchOptions.defaultValue}
        onSearch={searchOptions.onSearch}
      />
    </Col>) : null;

    const dateRangePicker = dateRangePickerOptions.isEnabled ?
    (<RangePicker
      defaultValue={[dateRangePickerOptions.from, dateRangePickerOptions.to]}
      format={dateRangePickerOptions.format}
      onChange={dateRangePickerOptions.onChange}
      disabled={dateRangePickerOptions.disabled}
    />) : null;

    const filtersMultiSelect = filtersOptions.map(filterOptions => {
      return (
        <MultiSelect
          key={filterOptions.name}
          name={filterOptions.name}
          displayElement={filterOptions.displayElement}
          menuItems={filterOptions.menuItems}
        />
      );
    });

    const visibilityMultiSelect = columnsVisibilityOptions.isEnabled ?
      (<MultiSelect
        name="columns"
        displayElement={<Icon type="layout" />}
        menuItems={({
          handleMenuClick: this.changeColumnVisibility,
          selectedItems: visibilitySelectedColumns,
          items: this.getHiddableColumns().map(column => ({ key: column.translationKey, value: column.key }))
        })}
      />) : null;

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header">
          {searchInput}
          <Col span={18} className="text-right" >
            {dateRangePicker}
            {filtersMultiSelect}
            {visibilityMultiSelect}
          </Col>
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            <Table columns={columns} dataSource={dataSource} onChange={onChange} loading={loading} pagination={extendedPagination} />
          </Col>
        </Row>
      </Row>
    );
  }

  renderActionsMenu(actions, record) {

    const onClick = item => {
      actions[parseInt(item.key, 0)].callback(record);
    };

    return (
      <Menu onClick={onClick}>
        { actions.map((action, index) => {
          return (
            <Menu.Item key={index.toString()}>
              <a>
                <FormattedMessage id={action.translationKey} />
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

    const {
      columnsDefinitions: {
        dataColumnsDefinition
      }
    } = this.props;

    const {
      visibilitySelectedColumns
    } = this.state;

    const dataColumns = dataColumnsDefinition.filter(column => {
      return !column.isHiddable || visibilitySelectedColumns.find((selectedColumn) => selectedColumn.value === column.key);
    }).map(dataColumn => {
      return {
        title: <FormattedMessage id={dataColumn.translationKey} />,
        dataIndex: dataColumn.key,
        key: dataColumn.key,
        render: dataColumn.render ? dataColumn.render : text => text,
        sorter: dataColumn.sorter ? dataColumn.sorter : false,
      };
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
              <Icon type="down" />
            </a>
          </Dropdown>);
        }
      };
    });

    return actionColumns;
  }

  changeColumnVisibility(selectedColumns) {
    const {
      columnsVisibilityOptions: {
        onChange
      }
    } = this.props;

    this.setState({
      visibilitySelectedColumns: selectedColumns.columns
    });
    if (onChange) onChange(selectedColumns);
  }

}

TableView.defaultProps = {
  searchOptions: {
    isEnabled: false
  },
  dateRangePickerOptions: {
    isEnabled: false,
    format: DEFAULT_RANGE_PICKER_DATE_FORMAT,
    disabled: false
  },
  pagination: {},
  filtersOptions: [],
  columnsVisibilityOptions: {
    isEnabled: false,
    onChange: () => {}
  }
};

TableView.propTypes = {
  searchOptions: PropTypes.shape({
    isEnabled: PropTypes.bool,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    onSearch: PropTypes.func
  }),
  dateRangePickerOptions: PropTypes.shape({
    isEnabled: PropTypes.bool,
    from: PropTypes.object, // momentjs
    to: PropTypes.object, // momentjs
    format: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  }),
  filtersOptions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    displayElement: PropTypes.element.isRequired,
    onCloseMenu: PropTypes.func,
    menuItems: PropTypes.shape({
      handleMenuClick: PropTypes.func,
      selectedItems: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string,
      })),
      items: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string,
      }))
    })
  })),
  columnsDefinitions: PropTypes.shape({
    dataColumnsDefinition: PropTypes.array,
    actionsColumnsDefinition: PropTypes.array
  }).isRequired,
  columnsVisibilityOptions: PropTypes.shape({
    isEnabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func
  }),
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired
};

export default TableView;
