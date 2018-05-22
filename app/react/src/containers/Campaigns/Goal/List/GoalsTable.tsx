import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Icon, Modal } from 'antd';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';
import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';

import * as GoalsActions from '../../../../state/Campaigns/Goal/actions';

import { GOAL_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  PaginationSearchSettings,
  DateSearchSettings,
  KeywordSearchSettings,
  LabelsSearchSettings,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';

import { getTableDataSource } from '../../../../state/Campaigns/Goal/selectors';

import GoalService from '../../../../services/GoalService';
import { Label } from '../../../Labels/Labels';
import { GoalResource } from '../../../../models/goal';
import { Index } from '../../../../utils';
import { McsRange } from '../../../../utils/McsMoment';

const messages = defineMessages({
  labelFilterBy: {
    id: 'goal.filterby.label',
    defaultMessage: 'Filter By Label',
  },
  goalModalConfirmDeleteTitle: {
    id: 'goals.table.delete.modal.title',
    defaultMessage: 'Are you sure you want to delete this goal?',
  },
  goalModalConfirmDeleteMessage: {
    id: 'goals.table.delete.modal.message',
    defaultMessage: "You'll not be able to recover it.",
  },
  goalModalConfirmDeleteOk: {
    id: 'goals.table.delete.modal.ok',
    defaultMessage: 'Delete Now',
  },
  goalModalConfirmDeleteCancel: {
    id: 'goals.table.delete.modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchBarPlaceholder: {
    id: 'goals.table.searchbar.placeholder',
    defaultMessage: 'Search Goals',
  },
  deleteGoalActionButton: {
    id: 'goals.table.delete.action.button',
    defaultMessage: 'Delete',
  },
});

export interface ParamFilters
  extends PaginationSearchSettings,
    DateSearchSettings,
    KeywordSearchSettings,
    LabelsSearchSettings {
  statuses?: string[];
}

interface MapStateToProps {
  labels: Label[];
  hasGoals: boolean;
  isFetchingGoals: boolean;
  isFetchingGoalsStat: boolean;
  dataSource: GoalResource[];
  totalGoals: number;
}

interface MapDispatchToProps {
  loadGoalsDataSource: (
    organisationId: string,
    filter: Index<any>,
    isInitialRender?: boolean,
  ) => GoalResource[];
  resetGoalsTable: () => any;
}

type GoalsTableProps = MapStateToProps &
  MapDispatchToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class GoalsTable extends React.Component<GoalsTableProps> {
  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
      loadGoalsDataSource,
    } = this.props;

    if (!isSearchValid(search, GOAL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, GOAL_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);
      loadGoalsDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: GoalsTableProps) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
      loadGoalsDataSource,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch, state },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, GOAL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, GOAL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
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

  handleDeleteGoal = (goal: GoalResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname, state, search },
      history,
      dataSource,
      loadGoalsDataSource,
      intl,
    } = this.props;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

    Modal.confirm({
      title: intl.formatMessage(messages.goalModalConfirmDeleteTitle),
      content: intl.formatMessage(messages.goalModalConfirmDeleteMessage),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messages.goalModalConfirmDeleteOk),
      cancelText: intl.formatMessage(messages.goalModalConfirmDeleteCancel),
      onOk() {
        return GoalService.deleteGoal(goal.id).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            loadGoalsDataSource(organisationId, filter);
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          } else {
            loadGoalsDataSource(organisationId, filter);
          }
        });
      },
      onCancel() {
        //
      },
    });
  };

  handleEditGoal = (goal: GoalResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    history.push(`/${organisationId}/campaigns/goals/${goal.id}/edit`);
  };

  updateLocationSearch = (params: Partial<ParamFilters>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, GOAL_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      isFetchingGoals,
      isFetchingGoalsStat,
      dataSource,
      totalGoals,
      hasGoals,
      labels,
      intl,
    } = this.props;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: intl.formatMessage(messages.searchBarPlaceholder),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values: McsRange) =>
        this.updateLocationSearch({
          from: values.from,
          to: values.to,
        }),
      values: {
        from: filter.from,
        to: filter.to,
      },
    };

    const columnsVisibilityOptions = {
      isEnabled: true,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalGoals,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isFetchingGoalsStat) {
        return <i className="mcs-table-cell-loading" />; // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: string, record: GoalResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/goals/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'CONVERSIONS',
        key: 'conversions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CONVERSION_VALUE',
        key: 'value',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.handleEditGoal,
          },
          {
            intlMessage: messages.deleteGoalActionButton,
            callback: this.handleDeleteGoal,
          },
        ],
      },
    ];

    const filtersOptions = [
      {
        displayElement: (
          <div>
            <FormattedMessage id="STATUS" /> <Icon type="down" />
          </div>
        ),
        selectedItems: filter.statuses.map((status: string) => ({
          key: status,
          value: status,
        })),
        items: [{ key: 'ARCHIVED', value: 'ARCHIVED' }],
        getKey: (item: { key: string; value: string }) => item.key,
        display: (item: { key: string; value: string }) => item.value,
        handleMenuClick: (values: Array<{ key: string; value: string }>) => {
          this.updateLocationSearch({
            statuses: values.map(item => item.value),
          });
        },
      },
    ];

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(
          (filteredLabelId: string) => filteredLabelId === label.id,
        )
          ? true
          : false;
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.labelFilterBy,
    };

    return hasGoals ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dateRangePickerOptions={dateRangePickerOptions}
          filtersOptions={filtersOptions}
          columnsVisibilityOptions={columnsVisibilityOptions}
          dataSource={dataSource}
          loading={isFetchingGoals}
          pagination={pagination}
          labelsOptions={labelsOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="goals" text="EMPTY_GOALS" />
    );
  }
}

const mapStateToProps = (state: any) => ({
  labels: state.labels.labelsApi.data,
  hasGoals: state.goalsTable.goalsApi.hasItems,
  isFetchingGoals: state.goalsTable.goalsApi.isFetching,
  isFetchingGoalsStat: state.goalsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalGoals: state.goalsTable.goalsApi.total,
});

const mapDispatchToProps = {
  loadGoalsDataSource: GoalsActions.loadGoalsDataSource,
  resetGoalsTable: GoalsActions.resetGoalsTable,
};

export default compose<GoalsTableProps, {}>(
  injectIntl,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(GoalsTable);
