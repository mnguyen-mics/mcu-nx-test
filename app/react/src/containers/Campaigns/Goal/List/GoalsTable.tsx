import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';
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
import {
  formatMetric,
  normalizeReportView,
} from '../../../../utils/MetricHelper';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { GoalsOptions, IGoalService } from '../../../../services/GoalService';
import { Label } from '../../../Labels/Labels';
import { McsRange } from '../../../../utils/McsMoment';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { McsIcon } from '../../../../components';
import { messages } from './messages';
import { Index } from '../../../../utils';
import {
  GoalTableResource,
  GoalResource,
} from '../../../../models/goal/GoalResource';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import ReportService from '../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

export interface ParamFilters
  extends PaginationSearchSettings,
    DateSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings,
    LabelsSearchSettings {
  statuses?: string[];
}

interface State {
  isLoadingGoals: boolean;
  isLoadingStats: boolean;
  dataSource: GoalTableResource[];
  totalGoals: number;
  hasGoals: boolean;
}

interface MapStateToProps {
  labels: Label[];
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = MapStateToProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class GoalsTable extends React.Component<Props, State> {
  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingGoals: false,
      isLoadingStats: false,
      dataSource: [],
      totalGoals: 0,
      hasGoals: true,
    };
  }
  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (!isSearchValid(search, GOAL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, GOAL_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);
      this.loadGoalsDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
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
        this.loadGoalsDataSource(
          nextOrganisationId,
          filter,
          checkEmptyDataSource,
        );
      }
    }
  }

  loadGoalsDataSource = (
    organisationId: string,
    filter: Index<any>,
    init: boolean = false,
  ) => {
    this.setState({
      isLoadingGoals: true,
      isLoadingStats: true,
    });
    const options: GoalsOptions = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (filter.label_id.length) {
      options.label_ids = filter.label_id;
    }
    if (filter.datamartId) {
      options.datamart_id = filter.datamartId;
    }
    this._goalService.getGoals(organisationId, options).then(result => {
      const goalsById = normalizeArrayOfObject(result.data, 'id');
      this.setState({
        dataSource: Object.keys(goalsById).map(goalId => {
          return {
            ...goalsById[goalId],
          };
        }),
        isLoadingGoals: false,
        totalGoals: result.total || 0,
        hasGoals: init ? result.count !== 0 : true,
      });

      ReportService.getConversionPerformanceReport(
        organisationId,
        filter.from,
        filter.to,
        ['goal_id'],
      ).then(statsResult => {
        const statsByGoalId = normalizeArrayOfObject(
          normalizeReportView(statsResult.data.report_view),
          'goal_id',
        );
        this.setState({
          isLoadingStats: false,
          dataSource: Object.keys(goalsById).map(goalId => {
            return {
              ...statsByGoalId[goalId],
              ...goalsById[goalId],
            };
          }),
        });
      });
    });
  };

  handleArchiveGoal = (goal: GoalResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname, state, search },
      history,
      intl,
      notifyError,
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch(search, GOAL_SEARCH_SETTINGS);

    const fetchGoals = (orgId: string, params: Index<any>) => {
      this.loadGoalsDataSource(organisationId, filter);
    };

    const updateGoal = () => {
      return this._goalService.updateGoal(goal.id, { ...goal, archived: true });
    };

    Modal.confirm({
      title: intl.formatMessage(messages.archiveGoalModalTitle),
      content: intl.formatMessage(messages.archiveGoalModalBody),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messages.archiveGoalModalOk),
      cancelText: intl.formatMessage(messages.archiveGoalModalCancel),
      onOk() {
        return updateGoal()
          .then(() => {
            if (
              Object.keys(dataSource).length === 1 &&
              filter.currentPage !== 1
            ) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              fetchGoals(organisationId, filter);
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              fetchGoals(organisationId, filter);
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
      labels,
      intl,
      workspace,
    } = this.props;

    const {
      dataSource,
      totalGoals,
      isLoadingStats,
      isLoadingGoals,
      hasGoals,
    } = this.state;

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
      if (isLoadingStats) {
        return <i className="mcs-table-cell-loading" />;
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
          key: d.id,
          value: d.name || d.token,
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
          loading={isLoadingGoals}
          pagination={pagination}
          labelsOptions={labelsOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="goals" text="EMPTY_GOALS" />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  labels: state.labels.labelsApi.data,
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps),
)(GoalsTable);
