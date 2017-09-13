import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Row, Col, Input } from 'antd';

import McsDateRangePicker from '../McsDateRangePicker';
import { MultiSelect } from '../Forms';
import TableView from './TableView';

const Search = Input.Search;
const DEFAULT_RANGE_PICKER_DATE_FORMAT = 'DD/MM/YYYY';

function withFilters(TableViewComponent) {

  class TableViewComponentWithFilters extends Component {

    getHideableColumns = () => {
      const {
        columnsDefinitions: {
          dataColumnsDefinition,
        },
      } = this.props;

      return dataColumnsDefinition.filter(column => column.isHideable);
    }

    state = {
      visibilitySelectedColumns: (this.getHideableColumns()
      .filter(column => column.isVisibleByDefault)
      .map(column => ({ key: column.translationKey, value: column.key }))
      ),
      waiting: true,
    }

    changeColumnVisibility = (selectedColumns) => {
      const {
        columnsVisibilityOptions: {
          onChange,
        },
      } = this.props;

      this.setState({
        visibilitySelectedColumns: selectedColumns.columns,
      });

      if (onChange) onChange(selectedColumns);
    }

    render() {

      const {
        searchOptions,
        dateRangePickerOptions,
        filtersOptions,
        columnsVisibilityOptions,
      } = this.props;

      const searchInput = searchOptions.isEnabled
      ? (
        <Col span={6}>
          <Search
            placeholder={searchOptions.placeholder}
            className="mcs-search-input"
            defaultValue={searchOptions.defaultValue}
            onSearch={searchOptions.onSearch}
          />
        </Col>
      )
      : null;

      const dateRangePicker = dateRangePickerOptions.isEnabled
      ? (
        <McsDateRangePicker
          values={dateRangePickerOptions.values}
          format={dateRangePickerOptions.format}
          onChange={dateRangePickerOptions.onChange}
          disabled={dateRangePickerOptions.disabled}
        />
      )
      : null;

      const filtersMultiSelect = filtersOptions.map(filterOptions => {
        return (
          <MultiSelect
            key={filterOptions.name}
            name={filterOptions.name}
            displayElement={filterOptions.displayElement}
            buttonClass={'mcs-table-filters-item'}
            menuItems={filterOptions.menuItems}
          />
        );
      });

      const visibilityMultiSelect = columnsVisibilityOptions.isEnabled
      ? (
        <MultiSelect
          name="columns"
          displayElement={<Icon type="layout" />}
          buttonClass={'mcs-table-filters-item'}
          menuItems={({
            handleMenuClick: this.changeColumnVisibility,
            selectedItems: this.state.visibilitySelectedColumns,
            items: this.getHideableColumns().map(column => ({
              key: column.translationKey,
              value: column.key,
            })),
          })}
        />
      )
      : null;

      return (
        <Row>
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
              <TableViewComponent {...this.props} visibilitySelectedColumns={this.state.visibilitySelectedColumns} />
            </Col>
          </Row>
        </Row>
      );
    }

  }

  TableViewComponentWithFilters.defaultProps = {
    searchOptions: {
      isEnabled: false,
    },
    dateRangePickerOptions: {
      isEnabled: false,
      format: DEFAULT_RANGE_PICKER_DATE_FORMAT,
      disabled: false,
    },
    pagination: {},
    filtersOptions: [],
    columnsVisibilityOptions: {
      isEnabled: false,
      onChange: () => {},
    },
    columnsDefinitions: { dataColumnsDefinition: [] },
    visibilitySelectedColumns: [],
  };

  TableViewComponentWithFilters.propTypes = {
    searchOptions: PropTypes.shape({
      isEnabled: PropTypes.bool,
      placeholder: PropTypes.string,
      defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      onSearch: PropTypes.func,
    }),
    dateRangePickerOptions: PropTypes.shape({
      isEnabled: PropTypes.bool,
      from: PropTypes.shape(), // momentjs
      to: PropTypes.shape(), // momentjs
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
        })),
      }),
    })),
    columnsDefinitions: PropTypes.shape({
      dataColumnsDefinition: PropTypes.array,
      actionsColumnsDefinition: PropTypes.array,
    }),
    columnsVisibilityOptions: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
      onChange: PropTypes.func,
    }),
  };

  return TableViewComponentWithFilters;
}

const TableViewFilters = withFilters(TableView);

export default TableViewFilters;
