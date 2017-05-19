import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../components/TableView';

import * as AutomationsListActions from '../../../state/Automations/actions';

import {
  AUTOMATIONS_LIST_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../state/Automations/selectors';

class AutomationsListTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveScenario = this.archiveScenario.bind(this);
    this.editAutomation = this.editAutomation.bind(this);
  }

  componentDidMount() {
    const {
      query,

      fetchAutomationList
    } = this.props;

    const filter = deserializeQuery(query, AUTOMATIONS_LIST_SETTINGS);
    fetchAutomationList(filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchAutomationList
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, AUTOMATIONS_LIST_SETTINGS);
      fetchAutomationList(filter);
    }
  }

  componentWillUnmount() {
    this.props.resetAutomationsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, AUTOMATIONS_LIST_SETTINGS)
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
      totalAutomations
    } = this.props;

    const filter = deserializeQuery(query, AUTOMATIONS_LIST_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAutomations,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: text => <span className={`mcs-campaigns-status-${text.toLowerCase()}`}><FormattedMessage id={text} /></span>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/library/scenarios/${record.id}`}>{text}</Link>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editAutomation
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveScenario
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

  editAutomation(campaign) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/library/scenarios/${campaign.id}`);
  }

  archiveScenario(campaign) {
    const {
      archiveAutomationList,
      fetchAutomationList,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, AUTOMATIONS_LIST_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAutomationList(campaign.id).then(() => {
          fetchAutomationList(filter);
        });
      },
      onCancel() { },
    });
  }

}

AutomationsListTable.defaultProps = {
  archiveAutomationList: () => { }
};

AutomationsListTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingAutomationList: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalAutomations: PropTypes.number.isRequired,

  fetchAutomationList: PropTypes.func.isRequired,
  archiveAutomationList: PropTypes.func.isRequired,
  resetAutomationsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingAutomationList: state.automationsTable.automationsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAutomations: state.automationsTable.automationsApi.total,
});

const mapDispatchToProps = {
  fetchAutomationList: AutomationsListActions.fetchAutomations,
  // archiveAutomationList: CampaignEmailAction.archiveAutomationList,
  resetAutomationsTable: AutomationsListActions.resetAutomationsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutomationsListTable);
