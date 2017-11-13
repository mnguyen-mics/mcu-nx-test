import * as React from 'react';
import { Icon, Row, Col, Input } from 'antd';

import { SearchProps } from 'antd/lib/input/Search';

import McsDateRangePicker, { McsDateRangePickerProps } from '../McsDateRangePicker';
import MultiSelect, { MultiSelectProps } from '../MultiSelect';
import { TableViewProps, VisibilitySelectedColumn } from './TableView';

const Search = Input.Search;

interface ViewComponentWithFiltersProps {
  searchOptions?: SearchProps;
  dateRangePickerOptions?: McsDateRangePickerProps;
  filtersOptions?: MultiSelectProps[];
  columnsVisibilityOptions?: {
    isEnabled?: boolean;
    onChange?: () => void;
  };
}

interface State {
  visibilitySelectedColumns: VisibilitySelectedColumn[];
}

type JoinedProps = TableViewProps & ViewComponentWithFiltersProps;
type HOCWrapped<P> = React.ComponentClass<P> | React.SFC<P>;

function withFilters(ViewComponent: HOCWrapped<TableViewProps>): React.ComponentClass<JoinedProps> {

  class ViewComponentWithFilters extends React.Component<JoinedProps, State> {

    static defaultProps: Partial<ViewComponentWithFiltersProps> = {
      columnsVisibilityOptions: {
        isEnabled: false,
      },
    };

    constructor(props: JoinedProps) {
      super(props);
      this.state = {
        visibilitySelectedColumns: this.props.columnsDefinitions ?
          (this.props.columnsDefinitions.dataColumnsDefinition
            .filter(column => column.isHideable && column.isVisibleByDefault)
            .map(column => ({ key: column.translationKey, value: column.key }))
          ) : [],
      };
    }

    getHideableColumns = () => {
      const {
        columnsDefinitions: {
          dataColumnsDefinition,
        },
      } = this.props;

      return dataColumnsDefinition.filter(column => column.isHideable);
    }

    changeColumnVisibility = (selectedColumns: { [name: string]: object[] }) => {
      this.setState({
        visibilitySelectedColumns: selectedColumns.columns as any,
      });
      // const onChange = this.props.columnsVisibilityOptions!.onChange;
      // if (onChange) onChange(selectedColumns);
    }

    render() {

      const {
        searchOptions,
        dateRangePickerOptions,
        filtersOptions,
        columnsVisibilityOptions,
      } = this.props;

      const searchInput = searchOptions
      ? (
        <Col span={6}>
          <Search
            className="mcs-search-input"
            {...searchOptions}
          />
        </Col>
      )
      : null;

      const dateRangePicker = dateRangePickerOptions
      ? (
        <McsDateRangePicker
          values={dateRangePickerOptions.values}
          format={dateRangePickerOptions.format}
          onChange={dateRangePickerOptions.onChange}
        />
      )
      : null;

      const filtersMultiSelect = filtersOptions ? filtersOptions.map(filterOptions => {
        return (
          <MultiSelect
            key={filterOptions.name}
            name={filterOptions.name}
            displayElement={filterOptions.displayElement}
            buttonClass={'mcs-table-filters-item'}
            menuItems={filterOptions.menuItems}
          />
        );
      }) : null;

      const visibilityMultiSelect = columnsVisibilityOptions!.isEnabled
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
              <ViewComponent {...this.props} visibilitySelectedColumns={this.state.visibilitySelectedColumns} />
            </Col>
          </Row>
        </Row>
      );
    }

  }

  return ViewComponentWithFilters;
}

export default withFilters;
