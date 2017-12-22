import * as React from 'react';
import { Checkbox, Radio } from 'antd';
import { omit } from 'lodash';
import { PaginationProps } from 'antd/lib/pagination';
import { TableView, TableViewFilters } from '../TableView';
import { DataColumnDefinition, TableViewProps } from '../TableView/TableView';
import { normalizeArrayOfObject } from '../../utils/Normalizer';
import { DataListResponse } from '../../services/ApiService';
import { SearchFilter, SelectableItem } from './';
import SelectorLayout from './SelectorLayout';

export interface TableSelectorProps<T extends SelectableItem> {
  actionBarTitle: string;
  columnsDefinitions: Array<DataColumnDefinition<T>>;
  displayFiltering?: boolean;
  searchPlaceholder?: string;
  selectedIds?: string[];
  fetchSelectorData: (filter?: SearchFilter) => Promise<DataListResponse<T>>;
  singleSelection?: boolean;
  save: (selectedIds: string[], selectedElement: T[]) => void;
  close: () => void;
}

interface State<T> {
  selectedElementsById: { [elementId: string]: T };
  elementsById: { [elementId: string]: T };
  allElementIds: string[];
  noElement: boolean;
  isLoading: boolean;
  total: number;
  pageSize: number;
  currentPage: number;
  keywords: string;
}

class TableSelector<T extends SelectableItem> extends React.Component<
  TableSelectorProps<T>,
  State<T>
> {
  static defaultProps: Partial<TableSelectorProps<any>> = {
    displayFiltering: false,
    selectedIds: [],
    singleSelection: false,
  };

  constructor(props: TableSelectorProps<T>) {
    super(props);
    this.state = {
      selectedElementsById: {},
      elementsById: {},
      allElementIds: [],
      noElement: false,
      isLoading: true,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      keywords: '',
    };
  }

  componentDidMount() {
    this.populateTable(this.props.selectedIds).then(response => {
      if (response.length === 0) {
        this.setState({
          noElement: true,
        });
      }
    });
  }

  componentDidUpdate(prevProps: TableSelectorProps<T>, prevState: State<T>) {
    const {
      currentPage,
      pageSize,
      keywords,
      selectedElementsById,
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
      keywords: prevKeywords,
    } = prevState;

    if (
      currentPage !== prevCurrentPage ||
      pageSize !== prevPageSize ||
      keywords !== prevKeywords
    ) {
      this.populateTable(Object.keys(selectedElementsById));
    }
  }

  getColumnsDefinitions = (): Array<DataColumnDefinition<T>> => {
    const { columnsDefinitions } = this.props;
    const { selectedElementsById } = this.state;

    return [
      {
        key: 'selected',
        render: (text: string, record: T) => {
          const Field = this.props.singleSelection ? Radio : Checkbox;
          return (
            <Field checked={!!selectedElementsById[record.id]}>{text}</Field>
          );
        },
      },
      ...columnsDefinitions,
    ];
  };

  getSearchOptions = () => {
    const { searchPlaceholder } = this.props;
    return {
      placeholder: searchPlaceholder ? searchPlaceholder : 'Search a template',
      onSearch: (value: string) => this.setState({ keywords: value }),
    };
  };

  handleAdd = () => {
    const { save } = this.props;
    const { selectedElementsById } = this.state;
    const selectedElementIds = Object.keys(selectedElementsById);
    const selectedElement = selectedElementIds.map(
      id => selectedElementsById[id],
    );

    save(selectedElementIds, selectedElement);
  };

  populateTable = (selectedIds: string[] = []) => {
    const { displayFiltering } = this.props;
    const { currentPage, keywords, pageSize } = this.state;

    const filterOptions = displayFiltering
      ? { currentPage, keywords, pageSize }
      : undefined;

    return this.props
      .fetchSelectorData(filterOptions)
      .then(({ data, total }) => {
        const allElementIds = data.map(element => element.id);
        const elementsById = normalizeArrayOfObject(data, 'id');
        const selectedElementsById = {
          ...this.state.selectedElementsById,
          ...selectedIds.reduce((acc, elementId) => {
            if (!this.state.selectedElementsById[elementId]) {
              return { ...acc, [elementId]: elementsById[elementId] };
            }
            return acc;
          }, {}),
        };

        this.setState({
          allElementIds,
          elementsById,
          selectedElementsById,
          isLoading: false,
          total: total || data.length,
        });

        return data;
      });
  };

  toggleElementSelection = (element: T) => {
    const elementId = element.id;
    this.setState(prevState => {
      const isElementSelected = prevState.selectedElementsById[elementId];

      if (this.props.singleSelection) {
        // only one element is kept
        return {
          selectedElementsById: isElementSelected
            ? {}
            : { [elementId]: prevState.elementsById[elementId] },
        };
      }

      if (isElementSelected) {
        // delete elementId key
        return {
          selectedElementsById: omit(prevState.selectedElementsById, elementId),
        };
      }

      return {
        // add element by elementId
        selectedElementsById: {
          ...prevState.selectedElementsById,
          [elementId]: prevState.elementsById[elementId],
        },
      };
    });
  };

  render() {
    const { actionBarTitle, close, displayFiltering } = this.props;
    const {
      elementsById,
      allElementIds,
      isLoading,
      currentPage,
      total,
      pageSize,
      noElement,
    } = this.state;

    const pagination: PaginationProps = {
      current: currentPage,
      pageSize,
      total,
      onChange: page => this.setState({ currentPage: page }),
      onShowSizeChange: (current, size) =>
        this.setState({ currentPage: 1, pageSize: size }),
    };

    const tableViewProps: TableViewProps<T> = {
      columns: this.getColumnsDefinitions(),
      dataSource: allElementIds.map(id => elementsById[id]),
      loading: isLoading,
      onRow: record => ({
        onClick: () => this.toggleElementSelection(record),
      }),
      pagination: pagination,
    };

    const renderedTable = displayFiltering ? (
      <TableViewFilters
        {...tableViewProps}
        searchOptions={this.getSearchOptions()}
      />
    ) : (
      <TableView {...tableViewProps} />
    );

    return (
      <SelectorLayout
        className="mcs-table-edit-container"
        actionBarTitle={actionBarTitle}
        handleAdd={this.handleAdd}
        handleClose={close}
        disabled={noElement}
      >
        {renderedTable}
      </SelectorLayout>
    );
  }
}

export default TableSelector;
