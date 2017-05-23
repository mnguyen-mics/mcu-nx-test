import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView, EmptyTableView } from '../../../../components/TableView';

import * as GoalsActions from '../../../../state/Campaigns/Goal/actions';

import { GOAL_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';

import {
  getTableDataSource
 } from '../../../../state/Campaigns/Goal/selectors';


class GoalsTable extends Component {

  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.handleArchiveGoal = this.handleArchiveGoal.bind(this);
    this.handleEditGoal = this.handleEditGoal.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname
      },
      match: {
        params: {
          organisationId
        }
      },
      loadGoalsDataSource
    } = this.props;

    if (!isSearchValid(search, GOAL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, GOAL_SEARCH_SETTINGS),
        state: { reloadDataSource: true }
      });
    } else {
      const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);
      loadGoalsDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          organisationId
        }
      },
      history,
      loadGoalsDataSource
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
      }
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, GOAL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, GOAL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId }
        });
      } else {
        const filter = parseSearch(nextSearch, GOAL_SEARCH_SETTINGS);
        loadGoalsDataSource(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetGoalsTable();
  }

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname
      }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, GOAL_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      translations,
      isFetchingGoals,
      isFetchingGoalsStat,
      dataSource,
      totalGoals,
      hasGoals
    } = this.props;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_DISPLAY,
      onSearch: value => this.updateLocationSearch({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateLocationSearch({
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
      onChange: (page) => this.updateLocationSearch({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
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
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${organisationId}/campaigns/display/report/${record.id}/basic`}>{text}</Link>
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
            this.updateLocationSearch({
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

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (hasGoals) ? (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingGoals}
      onChange={() => {}}
      searchOptions={searchOptions}
      dateRangePickerOptions={dateRangePickerOptions}
      filtersOptions={filtersOptions}
      columnsVisibilityOptions={columnsVisibilityOptions}
      pagination={pagination}
    />) : (<EmptyTableView icon="goals" text="EMPTY_GOALS" />);

  }

  handleEditGoal(goal) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history
    } = this.props;

    history.push(`/${organisationId}/goals/${goal.id}`);
  }

  handleArchiveGoal(goal) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      archiveGoal,
      loadGoalsDataSource,
      translations
    } = this.props;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

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
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  hasGoals: PropTypes.bool.isRequired,
  isFetchingGoals: PropTypes.bool.isRequired,
  isFetchingGoalsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalGoals: PropTypes.number.isRequired,

  loadGoalsDataSource: PropTypes.func.isRequired,
  archiveGoal: PropTypes.func.isRequired,
  resetGoalsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translations: state.translations,

  hasGoals: state.goalsTable.goalsApi.hasItems,
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

GoalsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalsTable);

GoalsTable = withRouter(GoalsTable);

export default GoalsTable;
