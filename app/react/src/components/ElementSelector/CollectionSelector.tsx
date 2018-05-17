import * as React from 'react';
import { omit } from 'lodash';
import { PaginationProps } from 'antd/lib/pagination';
import { CollectionView, CollectionViewFilters } from '../TableView';
import { CollectionViewProps } from '../TableView/CollectionView';
import { normalizeArrayOfObject } from '../../utils/Normalizer';
import { DataListResponse, DataResponse } from '../../services/ApiService';
import { SearchFilter, SelectableItem } from './';
import SelectorLayout from './SelectorLayout';

export interface CollectionSelectorProps<T extends SelectableItem> {
  actionBarTitle: string;
  renderCollectionItem: (
    element: T,
    isSelected: boolean,
    handleSelect: (element: T) => void,
  ) => JSX.Element;
  displayFiltering?: boolean;
  searchPlaceholder?: string;
  selectedIds?: string[];
  fetchDataList: (filter?: SearchFilter) => Promise<DataListResponse<T>>;
  fetchData: (id: string) => Promise<DataResponse<T>>;
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

class CollectionSelector<T extends SelectableItem> extends React.Component<
  CollectionSelectorProps<T>,
  State<T>
  > {
  static defaultProps: Partial<CollectionSelectorProps<any>> = {
    displayFiltering: false,
    selectedIds: [],
    singleSelection: false,
  };

  constructor(props: CollectionSelectorProps<T>) {
    super(props);
    this.state = {
      selectedElementsById: {},
      elementsById: {},
      allElementIds: [],
      noElement: false,
      isLoading: false,
      total: 0,
      pageSize: 12,
      currentPage: 1,
      keywords: '',
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    Promise.all([
      this.fetchNewData(this.props.selectedIds).then((response: any[]) => {
        if (response.length === 0) {
          this.setState({
            noElement: true,
          });
        }
      }),
      this.loadSelectedElementsById(),
    ]).then(() => {
      this.setState({ isLoading: false });
    });
  }

  loadSelectedElementsById = () => {
    const { selectedIds } = this.props;

    if (selectedIds) {
      const promises: Array<Promise<T>> = [];
      selectedIds.forEach((id) => {
        promises.push(this.props.fetchData(id).then(resp => resp.data));
      });
      Promise.all(promises).then(selectedElements => {
        this.setState({
          selectedElementsById: normalizeArrayOfObject(selectedElements, 'id'),
        });
      });
    }
  };

  componentDidUpdate(
    prevProps: CollectionSelectorProps<T>,
    prevState: State<T>,
  ) {
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
      this.fetchNewData(Object.keys(selectedElementsById));
    }
  }

  getSearchOptions = () => {
    const { searchPlaceholder } = this.props;
    return {
      placeholder: searchPlaceholder ? searchPlaceholder : 'Search a template',
      onSearch: (value: string) => this.setState({ keywords: value, currentPage: 1 }),
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

  fetchNewData = (selectedIds: string[] = []) => {
    const { displayFiltering } = this.props;
    const { currentPage, keywords, pageSize } = this.state;

    const filterOptions = displayFiltering
      ? { currentPage, keywords, pageSize }
      : undefined;
    this.setState({ isLoading: true })
    return this.props
      .fetchDataList(filterOptions)
      .then(({ data, total }) => {
        const allElementIds = data.map(element => element.id);
        const elementsById = normalizeArrayOfObject(data, 'id');

        this.setState({
          allElementIds,
          elementsById,
          total: total || data.length,
          isLoading: false
        });

        return data;
      });
  };

  toggleElementSelection = (element: T) => {
    const elementId = element.id;
    this.setState(prevState => {
      const isElementSelected = !!prevState.selectedElementsById[elementId];

      if (this.props.singleSelection) {
        // only one element is kept
        return {
          selectedElementsById: isElementSelected
            ? {}
            : { [elementId]: element },
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
          [elementId]: element,
        },
      };
    });
  };

  buildCollectionItems = () => {
    const { renderCollectionItem } = this.props;
    const { allElementIds, elementsById, selectedElementsById } = this.state;

    return allElementIds.map(id => {
      return renderCollectionItem(
        elementsById[id],
        !!selectedElementsById[id],
        this.toggleElementSelection,
      );
    });
  };

  render() {
    const { actionBarTitle, close, displayFiltering } = this.props;
    const { isLoading, currentPage, total, pageSize, noElement } = this.state;

    const pagination: PaginationProps = {
      pageSizeOptions: ['12', '24', '36', '48'],
      size: 'small',
      showSizeChanger: true,
      className: 'ant-table-pagination mini',
      current: currentPage,
      pageSize,
      total,
      onChange: page => this.setState({ currentPage: page }),
      onShowSizeChange: (current, size) =>
        this.setState({ currentPage: 1, pageSize: size }),
    };

    const collectionViewProps: CollectionViewProps = {
      collectionItems: this.buildCollectionItems(),
      loading: isLoading,
      pagination: pagination,
    };

    const renderedCollection = displayFiltering ? (
      <CollectionViewFilters
        {...collectionViewProps}
        searchOptions={this.getSearchOptions()}
      />
    ) : (
        <CollectionView {...collectionViewProps} />
      );

    return (
      <SelectorLayout
        actionBarTitle={actionBarTitle}
        handleAdd={this.handleAdd}
        handleClose={close}
        disabled={noElement}
      >
        {renderedCollection}
      </SelectorLayout>
    );
  }
}

export default CollectionSelector;
