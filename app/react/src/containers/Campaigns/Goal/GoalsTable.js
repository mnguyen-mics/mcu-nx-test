import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Icon, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView, EmptyTableView } from '../../../components/TableView';

import * as GoalsActions from '../../../state/Campaigns/Goal/actions';

import {
  GOAL_QUERY_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../RouteQuerySelector';

import { formatMetric } from '../../../utils/MetricHelper';

import {
  getTableDataSource
 } from '../../../state/Campaigns/Goal/selectors';


class GoalsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.handleArchiveGoal = this.handleArchiveGoal.bind(this);
    this.handleEditGoal = this.handleEditGoal.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,
      loadGoalsDataSource
    } = this.props;

    const filter = deserializeQuery(query, GOAL_QUERY_SETTINGS);
    loadGoalsDataSource(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      loadGoalsDataSource
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, GOAL_QUERY_SETTINGS);
      loadGoalsDataSource(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetGoalsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, GOAL_QUERY_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      translations,
      hasFetchedGoals,
      isFetchingGoals,
      isFetchingGoalsStat,
      dataSource,
      totalGoals
    } = this.props;

    const filter = deserializeQuery(query, GOAL_QUERY_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_DISPLAY,
      onSearch: value => this.updateQueryParams({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateQueryParams({
        rangeType: values.rangeType,
        lookbackWindow: values.lookbackWindow,
        from: values.from,
        to: values.to,
      }),
      values: {
        rangeType: filter.rangeType,
        lookbackWindow: filter.lookbackWindow,
        from: filter.from,
        to: filter.to
      }
    };

    const columnsVisibilityOptions = {
      isEnabled: true
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalGoals,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingGoalsStat) {
        return (<i className="mcs-loading" />); // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/campaigns/display/report/${record.id}/basic`}>{text}</Link>
      },
      {
        translationKey: 'CONVERSIONS',
        key: 'conversions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'CONVERSION_VALUE',
        key: 'value',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR')
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.handleEditGoal
          }, {
            translationKey: 'ARCHIVE',
            callback: this.handleArchiveGoal
          }
        ]
      }
    ];

    const filtersOptions = [
      {
        name: 'status',
        displayElement: (<div><FormattedMessage id="STATUS" /> <Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => {
            this.updateQueryParams({
              statuses: value.status.map(item => item.value)
            });
          },
          selectedItems: filter.statuses.map(status => ({ key: status, value: status })),
          items: [
            { key: 'ARCHIVED', value: 'ARCHIVED' }
          ]
        }
      }
    ];

    let activeFilters = 0;
    filtersOptions.forEach(item => {
      if (Object.prototype.hasOwnProperty.call(item.menuItems, 'selectedItems') === true) {
        activeFilters += item.menuItems.selectedItems.length;
      }
    });
    const hasFilters = activeFilters !== 0 ? true : false;

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (!hasFilters && dataSource.length === 0 && hasFetchedGoals === true) ? (<EmptyTableView text="EMPTY_GOALS" icon="goals" />) : (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      hasFetched={hasFetchedGoals}
      loading={isFetchingGoals}
      onChange={() => {}}
      searchOptions={searchOptions}
      dateRangePickerOptions={dateRangePickerOptions}
      filtersOptions={filtersOptions}
      columnsVisibilityOptions={columnsVisibilityOptions}
      pagination={pagination}
    />);

  }

  handleEditGoal(goal) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/goals/${goal.id}`);
  }

  handleArchiveGoal(goal) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveGoal,
      loadGoalsDataSource,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, GOAL_QUERY_SETTINGS);

    Modal.confirm({
      title: translations.GOAL_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.GOAL_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveGoal(goal.id).then(() => {
          loadGoalsDataSource(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

}

GoalsTable.defaultProps = {
  archiveGoal: () => {}
};

GoalsTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  hasFetchedGoals: PropTypes.bool.isRequired,
  isFetchingGoals: PropTypes.bool.isRequired,
  isFetchingGoalsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalGoals: PropTypes.number.isRequired,

  loadGoalsDataSource: PropTypes.func.isRequired,
  archiveGoal: PropTypes.func.isRequired,
  resetGoalsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  hasFetchedGoals: state.goalsTable.goalsApi.hasFetched,
  isFetchingGoals: state.goalsTable.goalsApi.isFetching,
  isFetchingGoalsStat: state.goalsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalGoals: state.goalsTable.goalsApi.total,
});

const mapDispatchToProps = {
  loadGoalsDataSource: GoalsActions.loadGoalsDataSource,
  // archiveGoal: GoalActions.archiveGoal,
  resetGoalsTable: GoalsActions.resetGoalsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalsTable);
