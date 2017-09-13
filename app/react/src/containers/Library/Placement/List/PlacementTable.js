import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { TableViewFilters, EmptyTableView } from '../../../../components/TableView';

import * as PlacementListsActions from '../../../../state/Library/PlacementLists/actions';

import { PLACEMENTS_SEARCH_SETTINGS } from './constants';
import { updateSearch, parseSearch, isSearchValid, buildDefaultSearch, compareSearches } from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state//Library/PlacementLists/selectors';

class PlacementListsTable extends Component {
  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archivePlacement = this.archivePlacement.bind(this);
    this.editPlacement = this.editPlacement.bind(this);
  }

  componentDidMount() {
    const { history, location: { search, pathname }, match: { params: { organisationId } }, fetchPlacementLists } = this.props;

    if (!isSearchValid(search, PLACEMENTS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, PLACEMENTS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, PLACEMENTS_SEARCH_SETTINGS);
      fetchPlacementLists(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      fetchPlacementLists,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, PLACEMENTS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, PLACEMENTS_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, PLACEMENTS_SEARCH_SETTINGS);
        fetchPlacementLists(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetPlacementLists();
  }

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PLACEMENTS_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      isFetchingAutomationList,
      dataSource,
      totalPlacements,
      hasAutomationList,
    } = this.props;

    const filter = parseSearch(search, PLACEMENTS_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: page =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current, size) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
    };

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${organisationId}/library/placementlists/${record.id}`}>{text}</Link>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editPlacement,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archivePlacement,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return hasAutomationList ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSource}
          loading={isFetchingAutomationList}
          onChange={() => {}}
          pagination={pagination}
        />
      </div>) : (<EmptyTableView iconType="library" text="EMPTY_LIBRARY_PLACEMENT" />);

  }

  editPlacement(placement) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(`/${organisationId}/library/placementlists/${placement.id}`);
  }

  archivePlacement(placement) {
    const { match: { params: { organisationId } }, location: { search }, archivePlacementList, fetchPlacementLists, translations } = this.props;

    const filter = parseSearch(search, PLACEMENTS_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.PLACEMENT_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.PLACEMENT_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archivePlacementList(placement.id).then(() => {
          fetchPlacementLists(organisationId, filter);
        });
      },
      onCancel() {},
    });
  }
}

PlacementListsTable.defaultProps = {
  archivePlacementList: () => {},
};

PlacementListsTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  hasAutomationList: PropTypes.bool.isRequired,
  isFetchingAutomationList: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,

  fetchPlacementLists: PropTypes.func.isRequired,
  archivePlacementList: PropTypes.func.isRequired,
  resetPlacementLists: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasAutomationList: state.placementListTable.placementListsApi.hasItems,
  isFetchingAutomationList: state.placementListTable.placementListsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.placementListTable.placementListsApi.total,
});

const mapDispatchToProps = {
  fetchPlacementLists: PlacementListsActions.fetchPlacementLists.request,
  // archivePlacementList: EmailCampaignAction.archivePlacementList,
  resetPlacementLists: PlacementListsActions.resetPlacementLists,
};

PlacementListsTable = connect(mapStateToProps, mapDispatchToProps)(PlacementListsTable);

PlacementListsTable = withRouter(PlacementListsTable);

export default PlacementListsTable;
