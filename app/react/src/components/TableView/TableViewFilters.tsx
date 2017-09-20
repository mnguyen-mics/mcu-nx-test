import * as React from 'react';
import PropTypes from 'prop-types';
import { Icon, Row, Col, Input } from 'antd';

import McsDateRangePicker from '../McsDateRangePicker';
import { MultiSelect } from '../Forms';
import TableView from './TableView';

const Search = Input.Search;


const DEFAULT_RANGE_PICKER_DATE_FORMAT: string = 'DD/MM/YYYY';

interface TableViewComponentWithFiltersProps {
  searchOptions?: {
    isEnabled?: boolean;
    placeholder?: string;
    defaultValue?: string | number;
    onSearch?: (value: string) => any;
  };
  dateRangePickerOptions?: {
    isEnabled?: boolean;
    from?: object; // momentjs
    to?: object; // momentjs
    format?: string;
    onChange?: (value: string) => any;
    disabled?: boolean;
    values?: any;
    translations: {};
  };
  filtersOptions?: [{
    name: string;
    displayElement: any;
    onCloseMenu?: Function;
    // menuItems?: {
    //   handleMenuClick?: Function;
    //   selectedItems?: [{
    //     key?: string;
    //     value?: string;
    //   }];
    //   items?: [{
    //     key?: string;
    //     value?: string;
    //   }];
    // };
    menuItems?: any;
    selectedItems?: any;
    key: string;
    buttonClass: string;
  }];
  columnsDefinitions?:{
    dataColumnsDefinition?: [{
      isHideable?: boolean;
      isVisibleByDefault?: boolean;
      translationKey?: string;
      key?: string;
    }];
    actionsColumnsDefinition?: Array<object>;
  };
  columnsVisibilityOptions?: {
    isEnabled?: boolean;
    onChange?: Function;
  };
}

interface TableViewComponentWithFiltersState {

}

const withFilters = (TableViewComponent) => {

  class TableViewComponentWithFilters extends React.Component<TableViewComponentWithFiltersProps, TableViewComponentWithFiltersState> {

    static defaultprops = {
      searchOptions: {
        isEnabled: false,
      },
      dateRangePickerOptions: {
        isEnabled: false,
        format: DEFAULT_RANGE_PICKER_DATE_FORMAT,
        disabled: false,        
        values: {}
      },
      pagination: {},
      filtersOptions: [],
      columnsVisibilityOptions: {
        isEnabled: false,
        onChange: () => {},
      },
      columnsDefinitions: { dataColumnsDefinition: [] },
      visibilitySelectedColumns: []
    }

    getHideableColumns = () => {
      const {
        columnsDefinitions: {
          dataColumnsDefinition,
        }
      } = this.props;

      return dataColumnsDefinition ? dataColumnsDefinition.filter(column => column.isHideable) : null;
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
          translations={dateRangePickerOptions.translations}
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
          key={"columns"}
          name={"columns"}
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

  return TableViewComponentWithFilters;
}

const TableViewFilters = withFilters(TableView);

export default TableViewFilters;
