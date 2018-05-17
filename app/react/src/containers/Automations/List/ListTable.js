import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal, Tooltip } from 'antd';
import { compose } from 'recompose';

import {
  EmptyTableView,
  TableViewFilters,
} from '../../../components/TableView/index.ts';
import McsIcon from '../../../components/McsIcon.tsx';

import * as AutomationsListActions from '../../../state/Automations/actions';

import { SCENARIOS_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../utils/LocationSearchHelper.ts';

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

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
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

  editAutomation = (record) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/automations/${record.id}/edit`);
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
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAutomations,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        currentPage: 1,
        pageSize: size,
      }),
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: text => (
          <Tooltip placement="top" title={translations[text]}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/automations/${record.id}/edit`}
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

    return (hasAutomations
      ? (
        <div className="mcs-table-container">
          <TableViewFilters
            columns={dataColumns}
            actionsColumnsDefinition={actionColumns}
            dataSource={dataSource}
            loading={isFetchingAutomationList}
            pagination={pagination}
          />
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

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )
)(AutomationsListTable);
