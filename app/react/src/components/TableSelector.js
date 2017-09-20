import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Button, Checkbox } from 'antd';

import { Actionbar } from '../containers/Actionbar';
import McsIcons from './McsIcons';
import { EmptyTableView, TableView } from './TableView';
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
  };

  componentDidMount() {
    this.populateTable().then(response => {
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
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
    } = prevState;

    if (currentPage !== prevCurrentPage || pageSize !== prevPageSize) {
      this.populateTable();
    }
  }

  getColumnsDefinitions = () => {
    const { columnsDefinitions } = this.props;
    const { selectedElementsById } = this.state;

    return {
      dataColumnsDefinition: [
        {
          key: 'selected',
          render: (text, record) => (
            <Checkbox
              checked={!!selectedElementsById[record.id]}
              onChange={() => this.toggleElementSelection(record.id)}
            >{text}
            </Checkbox>
          ),
        },
        ...columnsDefinitions,
      ],
      actionsColumnsDefinition: [],
    };
  }

  handleAdd = () => {
    const { save } = this.props;
    const { selectedElementsById } = this.state;
    const selectedElements = Object.keys(selectedElementsById);

    save(selectedElements);
  }

  populateTable = () => {
    const { selectedIds } = this.props;

    return this.props.fetchSelectorData()
        .then((results) => {
          const allElementIds = results.map(element => element.id);
          const elementsById = normalizeArrayOfObject(results, 'id');

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
              total: results.length
            };
          });

          return results;
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
    console.log('this.state = ', this.state);
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
      currentPage,
      pageSize,
      total,
      onChange: page => this.setState({ currentPage: page }),
      onShowSizeChange: (current, size) => this.setState({ pageSize: size }),
    };

    const datasource = allElementIds.map(id => elementsById[id]);

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an existing template' }]} edition>
            <Button type="primary mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span>Add</span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-table-edit-container">
              {noElement
                ? <EmptyTableView iconType="file" />
                : <TableView
                  columnsDefinitions={this.getColumnsDefinitions()}
                  dataSource={datasource}
                  loading={isLoading}
                  pagination={pagination}
                />
              }
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

TableSelector.defaultProps = {
  selectedIds: [],
  singleSelection: false,
};

TableSelector.propTypes = {
  close: PropTypes.func.isRequired,
  columnsDefinitions: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  fetchSelectorData: PropTypes.func.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  save: PropTypes.func.isRequired,
  singleSelection: PropTypes.bool,
};

export default TableSelector;
