import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Layout, Radio } from 'antd';

import { Actionbar } from '../containers/Actionbar';
import McsIcons from './McsIcons.tsx';
import { EmptyTableView, TableView, TableViewFilters } from './TableView/index.ts';
import { normalizeArrayOfObject } from '../utils/Normalizer';

const { Content } = Layout;

class TableSelector extends Component {

  state = {
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

  componentDidMount() {
    this.populateTable(this.props.selectedIds)
      .then(response => {
        if (response.length === 0) {
          this.setState({
            noElement: true,
          });
        }
      });
  }

  componentDidUpdate(prevProps, prevState) {
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

    if (currentPage !== prevCurrentPage || pageSize !== prevPageSize || keywords !== prevKeywords) {
      this.populateTable(Object.keys(selectedElementsById));
    }
  }

  getColumnsDefinitions = () => {
    const { columnsDefinitions } = this.props;
    const { selectedElementsById } = this.state;

    return {
      dataColumnsDefinition: [
        {
          key: 'selected',
          render: (text, record) => {
            const Field = (this.props.singleSelection ? Radio : Checkbox);

            return (
              <Field
                checked={!!selectedElementsById[record.id]}
                onChange={() => this.toggleElementSelection(record.id)}
              >{text}
              </Field>
            );
          },
        },
        ...columnsDefinitions,
      ],
      actionsColumnsDefinition: [],
    };
  }

  getSearchOptions = () => {
    return {
      placeholder: 'Search a template',
      onSearch: (value) => {
        this.setState({
          keywords: value,
        });
      },
    };
  }

  handleAdd = () => {
    const { save } = this.props;
    const { selectedElementsById } = this.state;
    const selectedElements = Object.keys(selectedElementsById);

    save(selectedElements);
  }

  populateTable = (selectedIds) => {
    const { displayFiltering } = this.props;
    const { currentPage, keywords, pageSize } = this.state;

    const filterOptions = (displayFiltering
      ? { currentPage, keywords, pageSize }
      : null
    );

    return this.props.fetchSelectorData(filterOptions)
      .then(({ data, total }) => {
        const allElementIds = data.map(element => element.id);
        const elementsById = normalizeArrayOfObject(data, 'id');

        this.setState(prevState => {
          const selectedElementsById = {
            ...prevState.selectedElementsById,
            ...selectedIds.reduce((acc, elementId) => {
              if (!prevState.selectedElementsById[elementId]) {
                return { ...acc, [elementId]: elementsById[elementId] };
              }
              return acc;
            }, {}),
          };

          return {
            allElementIds,
            elementsById,
            selectedElementsById,
            isLoading: false,
            total,
          };
        });

        return data;
      });
  }

  toggleElementSelection = (elementId) => {
    this.setState(prevState => {
      const isElementSelected = prevState.selectedElementsById[elementId];

      if (this.props.singleSelection) {
        return {
          selectedElementsById: (isElementSelected
            ? {}
            : { [elementId]: prevState.elementsById[elementId] }
          )
        };
      }

      if (isElementSelected) {
        return {
          selectedElementsById: Object.keys(prevState.selectedElementsById)
            .filter(id => id !== elementId)
            .reduce((acc, id) => {
              return { ...acc, [id]: prevState.selectedElementsById[id] };
            }, {}),
        };
      }

      return {
        selectedElementsById: {
          ...prevState.selectedElementsById,
          [elementId]: prevState.elementsById[elementId],
        },
      };
    });
  }

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

    const pagination = {
      current: currentPage,
      pageSize,
      total,
      onChange: page => this.setState({ currentPage: page }),
      onShowSizeChange: (current, size) => this.setState({ pageSize: size }),
    };

    const tableViewProps = {
      columnsDefinitions: this.getColumnsDefinitions(),
      dataSource: allElementIds.map(id => elementsById[id]),
      loading: isLoading,
      onRowClick: this.toggleElementSelection,
      pagination: pagination,
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: actionBarTitle }]} edition>
            <Button type="primary mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span>Add</span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon mcs-table-cursor"
              onClick={close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-table-edit-container">
              {noElement
                ? <EmptyTableView iconType="file" />
                : (displayFiltering
                  ? (
                    <TableViewFilters
                      {...tableViewProps}
                      searchOptions={this.getSearchOptions()}
                    />
                  )
                  : <TableView {...tableViewProps} />
                )
              }
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

TableSelector.defaultProps = {
  actionBarTitle: 'Add an existing template',
  displayFiltering: false,
  selectedIds: [],
  singleSelection: false,
};

TableSelector.propTypes = {
  actionBarTitle: PropTypes.string,
  close: PropTypes.func.isRequired,
  columnsDefinitions: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  displayFiltering: PropTypes.bool,
  fetchSelectorData: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  save: PropTypes.func.isRequired,
  singleSelection: PropTypes.bool,
};

export default TableSelector;
