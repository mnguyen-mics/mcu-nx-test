import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../../components/TableView';

import * as PlacementListsActions from '../../../../state/Library/PlacementLists/actions';

import {
  PLACEMENT_LISTS_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../../state//Library/PlacementLists/selectors';

class PlacementListsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archivePlacement = this.archivePlacement.bind(this);
    this.editPlacement = this.editPlacement.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,

      fetchPlacementLists
    } = this.props;

    const filter = deserializeQuery(query, PLACEMENT_LISTS_SETTINGS);
    fetchPlacementLists(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchPlacementLists
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, PLACEMENT_LISTS_SETTINGS);
      fetchPlacementLists(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetPlacementListsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, PLACEMENT_LISTS_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      isFetchingAutomationList,
      dataSource,
      totalPlacements
    } = this.props;

    const filter = deserializeQuery(query, PLACEMENT_LISTS_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/library/placementlists/${record.id}`}>{text}</Link>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editPlacement
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archivePlacement
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingAutomationList}
      onChange={() => {}}
      pagination={pagination}
    />);

  }

  editPlacement(placement) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/library/placementlists/${placement.id}`);
  }

  archivePlacement(placement) {
    const {
      activeWorkspace: {
        organisationId
      },
      archivePlacementList,
      fetchPlacementLists,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, PLACEMENT_LISTS_SETTINGS);

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
      onCancel() { },
    });
  }

}

PlacementListsTable.defaultProps = {
  archivePlacementList: () => { }
};

PlacementListsTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingAutomationList: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,

  fetchPlacementLists: PropTypes.func.isRequired,
  archivePlacementList: PropTypes.func.isRequired,
  resetPlacementListsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingAutomationList: state.placementListTable.placementListsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.placementListTable.placementListsApi.total,
});

const mapDispatchToProps = {
  fetchPlacementLists: PlacementListsActions.fetchPlacementLists.request,
  // archivePlacementList: CampaignEmailAction.archivePlacementList,
  resetPlacementListsTable: PlacementListsActions.resetPlacementListsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlacementListsTable);
