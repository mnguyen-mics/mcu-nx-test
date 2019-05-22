import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
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
  DatamartSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import { formatMetric } from '../../../../utils/MetricHelper';
import { getTableDataSource } from '../../../../state/Campaigns/Goal/selectors';
import { getWorkspace } from '../../../../state/Session/selectors';
import GoalService from '../../../../services/GoalService';
import { Label } from '../../../Labels/Labels';
import { GoalResource } from '../../../../models/goal';
import { Index } from '../../../../utils';
import { McsRange } from '../../../../utils/McsMoment';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { McsIcon } from '../../../../components';

const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  labelFilterBy: {
    id: 'goal.filterby.label',
    defaultMessage: 'Filter By Label',
  },
  archiveGoalModalTitle: {
    id: 'goals.table.archive.modal.title',
    defaultMessage: 'Are you sure you want to archive this goal?',
  },
  archiveGoalModalBody: {
    id: 'goals.table.archive.modal.message',
    defaultMessage: "You'll not be able to recover it.",
  },
  archiveGoalModalOk: {
    id: 'goals.table.archive.modal.ok',
    defaultMessage: 'Archive Now',
  },
  archiveGoalModalCancel: {
    id: 'goals.table.archive.modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchBarPlaceholder: {
    id: 'goals.table.searchbar.placeholder',
    defaultMessage: 'Search Goals',
  },
  archiveGoalActionButton: {
    id: 'goals.table.archive.action.button',
    defaultMessage: 'Archive',
  },
  ACTIVE: {
    id: 'goals.table.status.active',
    defaultMessage: 'Active',
  },
  PAUSED: {
    id: 'goals.table.status.paused',
    defaultMessage: 'Paused',
  },
  status: {
    id: 'goals.table.column.status',
    defaultMessage: 'Status',
  },
  name: {
    id: 'goals.table.column.name',
    defaultMessage: 'Name',
  },
  conversions: {
    id: 'goals.table.column.conversions',
    defaultMessage: 'Conversions',
  },
  conversionValue: {
    id: 'goals.table.column.conversionValue',
    defaultMessage: 'Conversion value',
  },
  edit: {
    id: 'goals.table.column.action.edit',
    defaultMessage: 'Edit',
  },
});

export interface ParamFilters
  extends PaginationSearchSettings,
    DateSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings,
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
  workspace: (organisationId: string) => UserWorkspaceResource;
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
  InjectedNotificationProps &
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

  handleArchiveGoal = (goal: GoalResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname, state, search },
      history,
      dataSource,
      loadGoalsDataSource,
      intl,
      notifyError,
    } = this.props;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

    Modal.confirm({
      title: intl.formatMessage(messages.archiveGoalModalTitle),
      content: intl.formatMessage(messages.archiveGoalModalBody),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messages.archiveGoalModalOk),
      cancelText: intl.formatMessage(messages.archiveGoalModalCancel),
      onOk() {
        return GoalService.updateGoal(goal.id, { ...goal, archived: true })
          .then(() => {
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
          })
          .catch(err => {
            notifyError(err);
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

    history.push(`/v2/o/${organisationId}/campaigns/goals/${goal.id}/edit`);
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
      workspace,
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
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string, record: GoalResource) => (
          <Tooltip placement="top" title={intl.formatMessage(messages[text])}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: GoalResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/goals/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.conversions,
        key: 'conversions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.conversionValue,
        key: 'value',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<GoalResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.edit,
            callback: this.handleEditGoal,
          },
          {
            intlMessage: messages.archiveGoalActionButton,
            callback: this.handleArchiveGoal,
          },
        ],
      },
    ];

    const filtersOptions: Array<MultiSelectProps<any>> = [
      {
        displayElement: (
          <div>
            <FormattedMessage
              id="goals.list.statusFilter"
              defaultMessage="Status"
            />{' '}
            <Icon type="down" />
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

    if (workspace(organisationId).datamarts.length > 1) {
      const datamartItems = workspace(organisationId)
        .datamarts.map(d => ({
          key: d.datamart_resource.id,
          value: d.datamart_resource.name || d.datamart_resource.token,
        }))
        .concat([
          {
            key: '',
            value: 'All',
          },
        ]);

      const datamartFilterOptions: MultiSelectProps<any> = {
        displayElement: (
          <div>
            <FormattedMessage
              id="goals.list.datamartFilter"
              defaultMessage="Datamart"
            />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.datamartId
          ? [datamartItems.find(di => di.key === filter.datamartId)]
          : [datamartItems],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamartId:
              datamartItem && datamartItem.key ? datamartItem.key : undefined,
          });
        },
      };

      filtersOptions.push(datamartFilterOptions);
    }

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
  workspace: getWorkspace(state),
});

const mapDispatchToProps = {
  loadGoalsDataSource: GoalsActions.loadGoalsDataSource,
  resetGoalsTable: GoalsActions.resetGoalsTable,
};

export default compose<GoalsTableProps, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(GoalsTable);
