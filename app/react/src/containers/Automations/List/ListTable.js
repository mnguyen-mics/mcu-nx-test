import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal, Tooltip } from 'antd';

import {
  TableView,
  EmptyTableView,
  TableViewFilters,
} from '../../../components/TableView';
import McsIcons from '../../../components/McsIcons';

import * as AutomationsListActions from '../../../state/Automations/actions';

import { SCENARIOS_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs,
} from '../../../utils/LocationSearchHelper';

import {
  getTableDataSource,
} from '../../../state/Automations/selectors';

class AutomationsListTable extends Component {

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
        },
      },
      fetchAutomationList,
    } = this.props;

    if (!isSearchValid(search, SCENARIOS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, SCENARIOS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);
      fetchAutomationList(organisationId, filter, true);
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
      fetchAutomationList,
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

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, SCENARIOS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, SCENARIOS_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, SCENARIOS_SEARCH_SETTINGS);
        fetchAutomationList(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAutomationsTable();
  }

  archiveScenario = (campaign) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      archiveAutomationList,
      fetchAutomationList,
      translations,
    } = this.props;

    const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAutomationList(campaign.id).then(() => {
          fetchAutomationList(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

  editAutomation(record) {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    history.push(`/o${organisationId}d${record.datamart_id}/library/scenarios/${record.id}`);
  }

  updateLocationSearch = (params) => {
    const {
      history,
      location: {
        search: currentSearch,
        pathname,
      },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, SCENARIOS_SEARCH_SETTINGS),
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
      totalAutomations,
      translations,
      hasAutomations,
    } = this.props;

    const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAutomations,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size,
      }),
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: text => (
          <Tooltip placement="top" title={translations[text]}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcons type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/o${organisationId}d${record.datamart_id}/library/scenarios/${record.id}`}
          >{text}
          </Link>
        ),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editAutomation,
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveScenario,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return (hasAutomations
      ? (
        <div className="mcs-table-container">
          <TableViewFilters>
            <TableView
              columnsDefinitions={columnsDefinitions}
              dataSource={dataSource}
              loading={isFetchingAutomationList}
              pagination={pagination}
            />
          </TableViewFilters>
        </div>
      )
      : <EmptyTableView iconType="automation" text="EMPTY_AUTOMATIONS" />
    );
  }
}

AutomationsListTable.defaultProps = {
  archiveAutomationList: () => { },
};

AutomationsListTable.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  hasAutomations: PropTypes.bool.isRequired,
  isFetchingAutomationList: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAutomations: PropTypes.number.isRequired,

  fetchAutomationList: PropTypes.func.isRequired,
  archiveAutomationList: PropTypes.func.isRequired,
  resetAutomationsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translations: state.translations,
  hasAutomations: state.automationsTable.automationsApi.hasItems,
  isFetchingAutomationList: state.automationsTable.automationsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAutomations: state.automationsTable.automationsApi.total,
});

const mapDispatchToProps = {
  fetchAutomationList: AutomationsListActions.fetchAutomations.request,
  // archiveAutomationList: EmailCampaignAction.archiveAutomationList,
  resetAutomationsTable: AutomationsListActions.resetAutomationsTable,
};

AutomationsListTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AutomationsListTable);

AutomationsListTable = withRouter(AutomationsListTable);

export default AutomationsListTable;
