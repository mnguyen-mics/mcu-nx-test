import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { EmptyTableView } from '../../../../components/TableView/index.ts';
import LibraryTable from '../../LibraryTable';
import * as PlacementListsActions from '../../../../state/Library/PlacementLists/actions';
import { getTableDataSource } from '../../../../state//Library/PlacementLists/selectors';
import { parseSearch, PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';

class PlacementListPage extends Component {

  archivePlacement = (placement) => {
    const {
      archivePlacementList,
      fetchPlacementLists,
      location: { search },
      match: { params: { organisationId } },
      translations,
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: translations.PLACEMENT_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.PLACEMENT_MODAL_CONFIRM_ARCHIVED_BODY,
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk: () => (
        archivePlacementList(placement.id)
          .then(() => fetchPlacementLists(organisationId, filter))
      ),
      onCancel: () => {},
    });
  }

  editPlacement = (placement) => {
    const {
      history,
      match: { params: { organisationId } },
    } = this.props;

    history.push(`/${organisationId}/library/placementlists/${placement.id}`);
  }

  getTableProps = () => {
    const {
      dataSource,
      match: { params: { organisationId } },
    } = this.props;

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'EDIT', callback: this.editPlacement },
            { translationKey: 'ARCHIVE', callback: this.archivePlacement },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'NAME',
          key: 'name',
          isHideable: false,
          render: (text, record) => (
            <Link
              className="mcs-campaigns-link"
              to={`/${organisationId}/library/placementlists/${record.id}`}
            >{text}
            </Link>
          ),
        },
      ],
    };

    return { columnsDefinitions, dataSource };
  }

  render() {
    const {
      fetchPlacementLists,
      hasAutomationList,
      isFetchingAutomationList,
      resetPlacementLists,
      totalPlacements
    } = this.props;

    const actions = {
      fetchElements: fetchPlacementLists,
      resetElements: resetPlacementLists,
    };

    const libraryProps = {
      loading: isFetchingAutomationList,
      total: totalPlacements,
    };

    const tableProps = this.getTableProps();

    return (!hasAutomationList
      ? <EmptyTableView iconType="library" text="EMPTY_LIBRARY_PLACEMENT" />
      : (
        <LibraryTable
          actions={actions}
          libraryProps={libraryProps}
          tableProps={tableProps}
        />
      )
    );
  }
}

PlacementListPage.defaultProps = {
  archivePlacementList: () => Promise.resolve(),
};

PlacementListPage.propTypes = {
  archivePlacementList: PropTypes.func.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchPlacementLists: PropTypes.func.isRequired,
  hasAutomationList: PropTypes.bool.isRequired,
  history: PropTypes.shape().isRequired,
  isFetchingAutomationList: PropTypes.bool.isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  resetPlacementLists: PropTypes.func.isRequired,
  totalPlacements: PropTypes.number.isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  dataSource: getTableDataSource(state),
  hasAutomationList: state.placementListTable.placementListsApi.hasItems,
  isFetchingAutomationList: state.placementListTable.placementListsApi.isFetching,
  totalPlacements: state.placementListTable.placementListsApi.total,
  translations: state.translations,
});

const mapDispatchToProps = {
  // archivePlacementList: EmailCampaignAction.archivePlacementList,
  fetchPlacementLists: PlacementListsActions.fetchPlacementLists.request,
  resetPlacementLists: PlacementListsActions.resetPlacementLists,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
  )(PlacementListPage);
