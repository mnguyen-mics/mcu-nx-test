import * as React from 'react';
import { LayoutOutlined } from '@ant-design/icons';
import { Row, Col, Input } from 'antd';
import cuid from 'cuid';
import { SearchProps } from 'antd/lib/input/Search';

import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import LabelsSelector, { LabelsSelectorProps } from '../LabelsSelector';
import TreeSelectFilter from '../TreeSelectFilter';
import { McsDateRangePicker, MultiSelect } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangePickerProps } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWrapper } from '.';
import { PartialTableViewProps } from './TableViewWrapper';

const Search = Input.Search;

export interface ViewComponentWithFiltersProps<T> extends PartialTableViewProps<T> {
  searchOptions?: SearchProps;
  dateRangePickerOptions?: McsDateRangePickerProps;
  filtersOptions?: Array<MultiSelectProps<any>>;
  treeSelectFilter?: () => React.ReactElement<TreeSelectFilter>;
  columnsVisibilityOptions?: {
    isEnabled?: boolean;
  };
  labelsOptions?: LabelsSelectorProps;
  relatedTable?: JSX.Element;
}

export interface FiltersState<T> {
  visibilitySelectedColumns: Array<DataColumnDefinition<T>>;
}
const VisibilityMultiSelect: React.ComponentClass<
  MultiSelectProps<DataColumnDefinition<any>>
> = MultiSelect;

class TableViewFilters<T> extends React.Component<
  ViewComponentWithFiltersProps<T>,
  FiltersState<T>
> {
  static defaultProps: Partial<ViewComponentWithFiltersProps<any>> = {
    columnsVisibilityOptions: {
      isEnabled: false,
    },
  };

  constructor(props: ViewComponentWithFiltersProps<T>) {
    super(props);
    this.state = {
      visibilitySelectedColumns: this.props
        .columns!.filter(column => column.isHideable && column.isVisibleByDefault)
        .map(column => ({ key: column.key, value: column.key })),
    };
  }

  getHideableColumns = (): Array<DataColumnDefinition<T>> => {
    const { columns } = this.props;

    return columns ? columns.filter(column => column.isHideable) : [];
  };

  changeColumnVisibility = (selectedColumns: Array<DataColumnDefinition<T>>) => {
    this.setState({
      visibilitySelectedColumns: selectedColumns,
    });
  };

  render() {
    const {
      searchOptions,
      dateRangePickerOptions,
      filtersOptions,
      columnsVisibilityOptions,
      labelsOptions,
      treeSelectFilter,
      relatedTable,
    } = this.props;

    const searchInput = searchOptions ? (
      <Search className='mcs-search-input' {...searchOptions} />
    ) : null;

    const dateRangePicker = dateRangePickerOptions ? (
      <McsDateRangePicker
        values={dateRangePickerOptions.values}
        format={dateRangePickerOptions.format}
        onChange={dateRangePickerOptions.onChange}
      />
    ) : null;

    const filtersMultiSelect = filtersOptions
      ? filtersOptions.map(filterOptions => {
          return (
            <MultiSelect {...filterOptions} key={cuid()} buttonClass='mcs-table-filters-item' />
          );
        })
      : null;

    const getItemKey = (item: DataColumnDefinition<T>) => item.key;
    const visibilityMultiSelect = columnsVisibilityOptions!.isEnabled ? (
      <VisibilityMultiSelect
        displayElement={<LayoutOutlined />}
        items={this.getHideableColumns()}
        getKey={getItemKey}
        display={getItemKey}
        selectedItems={this.state.visibilitySelectedColumns}
        handleMenuClick={this.changeColumnVisibility}
        buttonClass={'mcs-table-filters-item'}
      />
    ) : null;

    return (
      <div>
        <Row className='mcs-table-header'>
          <Col span={6}>{searchInput}</Col>
          <Col span={18} className='mcs-table-header-right'>
            {dateRangePicker}
            {treeSelectFilter ? treeSelectFilter() : null}
            {filtersMultiSelect}
            {visibilityMultiSelect}
          </Col>
        </Row>
        {labelsOptions ? (
          <Row className='mcs-table-labels'>
            <LabelsSelector {...labelsOptions} />
          </Row>
        ) : null}
        {!!relatedTable && relatedTable}
        <Row className='mcs-table-body'>
          <Col span={24}>
            <TableViewWrapper
              {...(this.props as any)}
              visibilitySelectedColumns={this.state.visibilitySelectedColumns}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default TableViewFilters;
