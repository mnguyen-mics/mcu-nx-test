import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Checkbox, Radio, Icon } from 'antd';
import { omit } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { PaginationProps } from 'antd/lib/pagination';
import { TableView, TableViewFilters } from '../TableView';
import { DataColumnDefinition, TableViewProps } from '../TableView/TableView';
import { normalizeArrayOfObject } from '../../utils/Normalizer';
import { DataListResponse, DataResponse } from '../../services/ApiService';
import { SearchFilter, SelectableItem } from './';
import SelectorLayout from './SelectorLayout';
import { MultiSelectProps } from '../MultiSelect';
import { getWorkspace } from '../../state/Session/selectors';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
} from '../../utils/LocationSearchHelper';

export interface TableSelectorProps<T extends SelectableItem> {
  actionBarTitle: string;
  columnsDefinitions: Array<DataColumnDefinition<T>>;
  displayFiltering?: boolean;
  searchPlaceholder?: string;
  filtersOptions?: Array<MultiSelectProps<any>>;
  selectedIds?: string[];
  fetchDataList: (filter?: SearchFilter) => Promise<DataListResponse<T>>;
  fetchData: (id: string) => Promise<DataResponse<T>>;
  singleSelection?: boolean;
  save: (selectedIds: string[], selectedElement: T[]) => void;
  close: () => void;
  displayDatamartSelector?: boolean;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface State<T>
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {
  selectedElementsById: { [elementId: string]: T };
  elementsById: { [elementId: string]: T };
  allElementIds: string[];
  noElement: boolean;
  isLoading: boolean;
  total: number;
}

type Props<T extends SelectableItem> = TableSelectorProps<T> &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class TableSelector<T extends SelectableItem> extends React.Component<
  Props<T>,
  State<T>
> {
  static defaultProps: Partial<TableSelectorProps<any>> = {
    displayFiltering: false,
    selectedIds: [],
    singleSelection: false,
  };

  constructor(props: Props<T>) {
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
      datamartId: '',
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    Promise.all([
      this.populateTable(this.props.selectedIds).then(response => {
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
      selectedIds.forEach(id => {
        promises.push(this.props.fetchData(id).then(resp => resp.data));
      });
      Promise.all(promises).then(selectedElements => {
        this.setState({
          selectedElementsById: normalizeArrayOfObject(selectedElements, 'id'),
        });
      });
    }
  };

  componentDidUpdate(prevProps: TableSelectorProps<T>, prevState: State<T>) {
    const {
      currentPage,
      pageSize,
      keywords,
      selectedElementsById,
      datamartId,
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
      keywords: prevKeywords,
      datamartId: prevDatamartId,
    } = prevState;

    if (
      currentPage !== prevCurrentPage ||
      pageSize !== prevPageSize ||
      keywords !== prevKeywords ||
      datamartId !== prevDatamartId
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

  getFiltersOptions = () => {
    const {
      displayDatamartSelector,
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const datamartItems = workspace(organisationId)
      .datamarts.map(d => ({
        key: d.id,
        value: d.name || d.token,
      }))
      .concat([
        {
          key: '',
          value: 'All',
        },
      ]);

    return displayDatamartSelector
      ? [
          {
            displayElement: (
              <div>
                <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
                <Icon type="down" />
              </div>
            ),
            selectedItems: this.state.datamartId
              ? [datamartItems.find(d => d.key === this.state.datamartId)]
              : [datamartItems],
            items: datamartItems,
            singleSelectOnly: true,
            getKey: (item: any) => (item && item.key ? item.key : ''),
            display: (item: any) => item.value,
            handleItemClick: (datamartItem: { key: string; value: string }) => {
              this.setState(
                {
                  datamartId:
                    datamartItem && datamartItem.key ? datamartItem.key : '',
                },
                () => {
                  this.populateTable(
                    Object.keys(this.state.selectedElementsById),
                  );
                },
              );
            },
          },
        ]
      : undefined;
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
    const { currentPage, keywords, pageSize, datamartId } = this.state;

    const filterOptions = displayFiltering
      ? { currentPage, keywords, pageSize, datamartId }
      : undefined;

    return this.props.fetchDataList(filterOptions).then(({ data, total }) => {
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
        filtersOptions={this.getFiltersOptions()}
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

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
});

export default compose<Props<any>, TableSelectorProps<any>>(
  connect(mapStateToProps, undefined),
  withRouter,
)(TableSelector);
