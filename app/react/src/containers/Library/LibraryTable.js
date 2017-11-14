import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { TableViewFilters } from '../../components/TableView/index.ts';

import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../utils/LocationSearchHelper';

class LibraryTable extends Component {

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      actions: { fetchElements },
    } = this.props;

    if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

      fetchElements(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      actions: { fetchElements },
      history,
      location: {
        search
      },
      match: {
        params: {
          organisationId
        }
      },
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state
      },
      match: {
        params: {
          organisationId: nextOrganisationId
        }
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, PAGINATION_SEARCH_SETTINGS);

        fetchElements(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.actions.resetElements();
  }

  updateLocationSearch = (params) => {
    const {
      history,
      location: { search: currentSearch, pathname }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      libraryProps: { loading, total },
      location: { search },
      tableProps,
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: page =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current, size) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
      total,
    };

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          {...tableProps}
          loading={loading}
          onChange={() => {}}
          pagination={pagination}
        />
      </div>
    );

  }
}

LibraryTable.propTypes = {
  actions: PropTypes.shape({
    fetchElements: PropTypes.func.isRequired,
    resetElements: PropTypes.func.isRequired,
  }).isRequired,

  history: PropTypes.shape().isRequired,

  libraryProps: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,

  location: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,

  tableProps: PropTypes.shape({
    columnsDefinitions: PropTypes.shape({
      actionsColumnsDefinition: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
      dataColumnsDefinition: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
    }),
    dataSource: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  }).isRequired
};

export default withRouter(LibraryTable);
