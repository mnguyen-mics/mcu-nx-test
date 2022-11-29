import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip, Modal } from 'antd';
import { compose } from 'recompose';
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
  defineMessages,
  MessageDescriptor,
} from 'react-intl';
import {
  AutomationResource,
  AutomationStatus,
  automationStatuses,
} from '../../../models/automations/automations';
import {
  updateSearch,
  compareSearches,
  isSearchValid,
  buildDefaultSearch,
  parseSearch,
} from '../../../utils/LocationSearchHelper';
import { MapDispatchToProps } from './AutomationListPage';
import { FilterParams } from '../../Campaigns/Display/List/DisplayCampaignsActionbar';
import messages from './messages';
import {
  SCENARIOS_SEARCH_SETTINGS,
  IScenarioService,
  GetAutomationsOptions,
} from '../../../services/ScenarioService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IDatamartService } from '../../../services/DatamartService';
import { McsIcon, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
  ExtendedTableRowSelection,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const messagesMap: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  NEW: {
    id: 'automations.list.status.new',
    defaultMessage: 'New',
  },
  ACTIVE: {
    id: 'automations.list.status.active',
    defaultMessage: 'Active',
  },
  PAUSED: {
    id: 'automations.list.status.paused',
    defaultMessage: 'Paused',
  },
  name: {
    id: 'automations.list.column.name',
    defaultMessage: 'Name',
  },
  status: {
    id: 'automations.list.column.status',
    defaultMessage: 'Status',
  },
  edit: {
    id: 'automations.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  oldAutomationModalTitle: {
    id: 'automations.list.oldAutomation.modal.title',
    defaultMessage: 'Not supported',
  },
  oldAutomationModalContent: {
    id: 'automations.list.oldAutomation.modal.content',
    defaultMessage: 'This is automation is not supported anymore.',
  },
});

interface AutomationsTableProps extends MapDispatchToProps {
  rowSelection: ExtendedTableRowSelection;
  isUpdatingStatuses: boolean;
}

interface State {
  dataSource: AutomationResource[];
  totalAutomations: number;
  isLoading: boolean;
}

type JoinedProps = AutomationsTableProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface Filters {
  currentPage?: number;
  pageSize?: number;
  keywords?: string;
  statuses?: string[];
}

class AutomationsListTable extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: false,
      dataSource: [],
      totalAutomations: 0,
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

    if (!isSearchValid(search, SCENARIOS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, SCENARIOS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);
      this.fetchAutomationList(organisationId, filter);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      isUpdatingStatuses,
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
      isUpdatingStatuses: previousIsUpdatingStatuses,
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId ||
      (isUpdatingStatuses !== previousIsUpdatingStatuses && isUpdatingStatuses === false)
    ) {
      if (!isSearchValid(search, SCENARIOS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, SCENARIOS_SEARCH_SETTINGS),
          state: {
            reloadDataSource: organisationId !== previousOrganisationId,
          },
        });
      } else {
        const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);
        this.fetchAutomationList(organisationId, filter);
      }
    }
  }

  fetchAutomationList = (organisationId: string, filter: Filters) => {
    this.setState({ isLoading: true });
    const options: GetAutomationsOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };
    if (filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (filter.statuses && filter.statuses.length) {
      options.status = filter.statuses;
    }
    return this._scenarioService.getScenarios(organisationId, options).then(res => {
      this.setState({
        isLoading: false,
        dataSource: res.data,
        totalAutomations: res.total || res.count,
      });
    });
  };

  editAutomation = (record: AutomationResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
      intl: { formatMessage },
    } = this.props;

    this._datamartService.getDatamart(record.datamart_id).then(resp => {
      if (resp.data.storage_model_version !== 'v201506') {
        history.push(`/v2/o/${organisationId}/automations/${record.id}/edit`, {
          from: `${location.pathname}${location.search}`,
        });
      } else {
        Modal.info({
          title: formatMessage(messagesMap.oldAutomationModalTitle),
          content: formatMessage(messagesMap.oldAutomationModalContent),
        });
      }
    });
  };

  deleteAutomation = (record: AutomationResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname, state },
      intl,
      history,
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);
    const deleteMethod = (automationId: string) => {
      return this._scenarioService.deleteScenario(automationId);
    };
    const fetchMethod = () => {
      if (dataSource.length === 1 && filter.currentPage !== 1) {
        const newFilter = {
          ...filter,
          currentPage: filter.currentPage - 1,
        };
        this.fetchAutomationList(organisationId, filter);
        history.replace({
          pathname: pathname,
          search: updateSearch(search, newFilter),
          state: state,
        });
      }
      this.fetchAutomationList(organisationId, filter);
    };
    Modal.confirm({
      title: intl.formatMessage(messages.automationModalConfirmDeletionTitle),
      content: intl.formatMessage(messages.automationModalConfirmDeletionContent),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage(messages.deleteAutomation),
      cancelText: intl.formatMessage(messages.automationModalConfirmDeletionCancel),
      onOk() {
        deleteMethod(record.id).then(() => {
          fetchMethod();
        });
      },
      onCancel() {
        //
      },
    });
  };

  activateOrPauseScenario = (scenario: AutomationResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      notifyError,
    } = this.props;

    const newStatus: AutomationStatus = scenario.status !== 'ACTIVE' ? 'ACTIVE' : 'PAUSED';

    const scenarioWithUpdatedStatus: AutomationResource = {
      ...scenario,
      status: newStatus,
    };

    this._scenarioService
      .updateScenario(scenario.id, scenarioWithUpdatedStatus)
      .then(() => {
        const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);
        this.fetchAutomationList(organisationId, filter);
      })
      .catch(err => {
        notifyError(err);
      });
  };

  updateLocationSearch = (params: any) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, SCENARIOS_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  viewAutomation = (record: AutomationResource) => () => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      intl: { formatMessage },
    } = this.props;

    this._datamartService.getDatamart(record.datamart_id).then(resp => {
      if (resp.data.storage_model_version !== 'v201506') {
        history.push(`/v2/o/${organisationId}/automations/${record.id}`);
      } else {
        Modal.info({
          title: formatMessage(messagesMap.oldAutomationModalTitle),
          content: formatMessage(messagesMap.oldAutomationModalContent),
        });
      }
    });
  };

  render() {
    const {
      location: { search },
      intl: { formatMessage },
      rowSelection,
    } = this.props;

    const { dataSource, totalAutomations, isLoading } = this.state;

    const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: formatMessage(messages.searchScenarios),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAutomations,
      onChange: (page: number, size: number) => {
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        });
      },
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const dataColumns: Array<DataColumnDefinition<AutomationResource>> = [
      {
        title: formatMessage(messagesMap.status),
        key: 'status',
        isHideable: false,
        render: (text: string) => (
          <Tooltip placement='top' title={formatMessage(messagesMap[text])}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type='status' />
            </span>
          </Tooltip>
        ),
      },
      {
        title: formatMessage(messagesMap.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: AutomationResource) => {
          return (
            <a onClick={this.viewAutomation(record)}>
              <span className='mcs-automation-link'>{text}</span>
            </a>
          );
        },
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<AutomationResource>> = [
      {
        key: 'action',
        actions: (scenario: AutomationResource) => [
          {
            message: formatMessage(messagesMap.edit),
            callback: this.editAutomation,
          },
          {
            message: formatMessage(messages.deleteAutomation),
            callback: this.deleteAutomation,
          },
          {
            message:
              scenario.status !== 'ACTIVE'
                ? formatMessage(messages.activateScenario)
                : formatMessage(messages.pauseScenario),
            callback: this.activateOrPauseScenario,
          },
        ],
      },
    ];

    const statusItems = automationStatuses.map(status => ({
      key: status,
      value: status,
    }));

    const filtersOptions = [
      {
        displayElement: (
          <div>
            <FormattedMessage id='automations.list.filterStatus' defaultMessage='Status' />{' '}
            <DownOutlined />
          </div>
        ),
        selectedItems: filter.statuses.map((status: AutomationStatus) => ({
          key: status,
          value: status,
        })),
        items: statusItems,
        getKey: (item: { key: AutomationStatus; value: AutomationStatus }) => item.key,
        display: (item: { key: AutomationStatus; value: AutomationStatus }) => item.value,
        handleMenuClick: (values: Array<{ key: AutomationStatus; value: AutomationStatus }>) =>
          this.updateLocationSearch({
            statuses: values.map(v => v.value),
          }),
      },
    ];

    return (
      <div className='mcs-table-container'>
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          filtersOptions={filtersOptions}
          dataSource={dataSource}
          loading={isLoading}
          pagination={pagination}
          rowSelection={rowSelection}
        />
      </div>
    );
  }
}

export default compose<JoinedProps, AutomationsTableProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AutomationsListTable);
