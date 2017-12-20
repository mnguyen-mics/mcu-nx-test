import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Layout, Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import { getPaginatedApiParam } from '../../../../utils/ApiHelper.ts';
import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';
import {
  EmptyTableView,
  CollectionViewFilters,
} from '../../../../components/TableView/index.ts';
import CreativeCard from './../../Common/CreativeCard.tsx';
import messages from './messages';

const { Content } = Layout;

class CreativeCardSelector extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedData: props.selectedData,
      data: [],
      hasData: true,
      isLoading: true,
      total: 0,
      pageSize: 12,
      currentPage: 1,
      keywords: '',
    };
  }

  fetchAllData = () => {
    const { currentPage, pageSize, keywords } = this.state;
    const options = getPaginatedApiParam(currentPage, pageSize);

    if (keywords) {
      options.keywords = keywords;
    }

    return this.props.fetchData(options);
  }

  componentDidMount() {
    this.fetchAllData().then((results) => {
      this.setState(() => ({
        ...results,
        isLoading: false,
        hasData: results.total > 0
      }));
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      currentPage,
      pageSize,
      keywords,
    } = this.state;
    const {
      currentPage: prevCurrentPage,
      pageSize: prevPageSize,
      keywords: prevKeywords,
    } = prevState;

    if (currentPage !== prevCurrentPage || pageSize !== prevPageSize || keywords !== prevKeywords) {
      this.fetchAllData()
        .then((results) => {
          this.setState({ ...results, isLoading: false });
        });
    }
  }

  buildCollectionItems = () => {
    const { data } = this.state;
    const columnDef = this.getColumnsDefinitions();

    return (data
      ? data.map(elem => (
        <CreativeCard
          footer={columnDef.footer}
          item={elem}
          key={elem.id}
          title={columnDef.title}
        />
        )
      )
      : null
    );
  }

  getColumnsDefinitions() {
    const { selectedData } = this.state;
    const selectedIds = selectedData
      .map(selection => selection[this.props.filterKey]);

    return {
      title: {
        key: 'name',
        render: (text) => {
          return <span>{text}</span>;
        }
      },
      footer: {
        key: 'selected',
        render: (text, record) => {
          const isSelected = selectedIds.includes(record.id);
          const message = (isSelected ? 'blastTemplateSelectedButton' : 'blastTemplateSelectButton');
          const buttonProps = {
            className: (isSelected ? 'mcs-primary' : ''),
            onClick: () => this.toggleSelection(record.id),
            type: (isSelected ? 'primary' : ''),
          };

          return (
            <Button {...buttonProps}>
              <FormattedMessage {...messages[message]} />
            </Button>
          );
        }
      }
    };
  }

  getSearchOptions() {
    return {
      placeholder: 'Search a template',
      onSearch: value => {
        this.setState(prevState => ({
          ...prevState,
          keywords: value,
        }));
      },
    };
  }

  handleAdd = () => {
    const { save } = this.props;
    const { selectedData } = this.state;

    save(selectedData);
  }

  toggleSelection(id) {
    this.setState(prevState => {
      const { selectedData } = this.state;
      const isElementSelected = prevState.selectedData.find(selection => selection[this.props.filterKey] === id);
      const newSelection = { };
      newSelection[this.props.filterKey] = id;
      if (this.props.singleSelection) {
        return {
          selectedData: (!isElementSelected ? [newSelection] : []),
        };
      }

      return {
        selectedData: (!isElementSelected
            ? [...selectedData, newSelection]
            : selectedData.filter(selection => selection[this.props.filterKey] !== id)
          )
      };
    });
  }

  render() {
    const {
      isLoading,
      currentPage,
      total,
      pageSize,
      hasData,
    } = this.state;

    const pagination = {
      size: 'small',
      showSizeChanger: true,
      className: 'ant-table-pagination mini',
      current: currentPage,
      pageSize,
      total,
      onChange: page =>
        this.setState(prevState => ({
          ...prevState,
          currentPage: page,
        })),
      onShowSizeChange: (current, size) =>
        this.setState(prevState => ({
          ...prevState,
          currentPage: 1,
          pageSize: size,
        })),
      pageSizeOptions: ['12', '24', '36', '48'],
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar path={[{ name: 'Add an existing template' }]} edition>
            <Button type="primary mcs-primary" onClick={this.handleAdd}>
              <McsIcons type="plus" /><span><FormattedMessage {...messages.blastTemplateAddButton} /></span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Content className="mcs-edit-container">
              {hasData ?
                <CollectionViewFilters
                  searchOptions={this.getSearchOptions()}
                  collectionItems={this.buildCollectionItems()}
                  loading={isLoading}
                  pagination={pagination}
                />
                 : <EmptyTableView iconType="file" />}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

CreativeCardSelector.defaultProps = {
  selectedData: [],
  singleSelection: false,
};

CreativeCardSelector.propTypes = {
  fetchData: PropTypes.func.isRequired,
  selectedData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
  })),
  save: PropTypes.func.isRequired,
  singleSelection: PropTypes.bool,
  close: PropTypes.func.isRequired,
  filterKey: PropTypes.string.isRequired,
};

export default compose(
  withMcsRouter,
)(CreativeCardSelector);
