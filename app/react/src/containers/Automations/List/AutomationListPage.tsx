import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { AutomationResource, AutomationStatus } from '../../../models/automations/automations';
import { FilterParams } from '../../Campaigns/Display/List/DisplayCampaignsActionbar';
import { TranslationProps } from '../../Helpers/withTranslations';
import { Label } from '../../Labels/Labels';
import injectDrawer, { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import ScenarioService, { GetAutomationsOptions, SCENARIOS_SEARCH_SETTINGS } from '../../../services/ScenarioService';
import { parseSearch, updateSearch } from '../../../utils/LocationSearchHelper';
import { Task, executeTasksInSequence } from '../../../utils/FormHelper';
import { UpdateMessage } from '../../Campaigns/Display/Dashboard/ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import AutomationListTable from './AutomationListTable';
import { getTableDataSource } from '../../../state/Automations/selectors';
import * as AutomationsListActions from '../../../state/Automations/actions';
import AutomationActionBar from './AutomationActionBar';

export interface MapDispatchToProps {
  labels: Label[];
  translations: TranslationProps;
  hasAutomations: boolean;
  isFetchingAutomations: boolean;
  isFetchingAutomationsStat: boolean;
  dataSource: AutomationResource[];
  totalAutomations: number;
}

export interface MapStateToProps {
    fetchAutomationList: (
        organisationId: string,
        filter: FilterParams,
        bool?: boolean,
    ) => void;
    resetAutomationsTable: () => void;
}

const { Content } = Layout;
interface AutomationListPageProps {
  totalAutomations: number;
  dataSource: AutomationResource[];
}

interface AutomationListPageState {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  visible: boolean;
  isUpdatingStatuses: boolean;
  isArchiving: boolean;
}

type JoinedProps = AutomationListPageProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  MapDispatchToProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationListPage extends React.Component<
  JoinedProps,
  AutomationListPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      visible: false,
      isUpdatingStatuses: false,
      isArchiving: false,
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  getAllAutomations = () => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
      totalAutomations,
    } = this.props;
    const options: GetAutomationsOptions = {
      organisation_id: organisationId,
      max_results: totalAutomations,
    };
    return ScenarioService.getScenarios(organisationId, options)
      .then(apiResp =>
        apiResp.data.map(scenarioResource => scenarioResource),
      )
      .catch(err => {
        notifyError(err);
      });
  };

  redirectAndNotify = () => {
    const {
      location: { search, pathname, state },
      history,
      dataSource,
      fetchAutomationList,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };
      fetchAutomationList(organisationId, filter);
      history.replace({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
        fetchAutomationList(organisationId, filter);
    }
    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
  };

  updateAutomationStatus = (
    scenario: AutomationResource,
    status: AutomationStatus,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: { status: string },
  ) => {
    this.setState({
      isUpdatingStatuses: true,
    });
    const { notifyError } = this.props;

    return ScenarioService.updateScenario(scenario.id, {
        id: scenario.id,
        name: scenario.name,
        status: status,
        datamart_id: scenario.datamart_id,
        organisation_id: scenario.organisation_id,
    }).then(response =>{
        this.setState({
            isUpdatingStatuses: false,
            selectedRowKeys: [],
          });
        return null;
    }).catch(error => {
        notifyError(error);
        this.setState({
          isUpdatingStatuses: false,
          selectedRowKeys: [],
        });
      });
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  selectAllItemIds = () => {
    this.setState({
      allRowsAreSelected: true,
    });
  };

  unselectAllItemIds = () => {
    this.setState({
      selectedRowKeys: [],
      allRowsAreSelected: false,
    });
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
  };

  handleStatusAction = (status: AutomationStatus) => {
    const {
      totalAutomations,
      match: {
        params: { organisationId },
      },
      fetchAutomationList,
      location: { search },
    } = this.props;
    const { allRowsAreSelected, selectedRowKeys } = this.state;
    this.setState({
      isUpdatingStatuses: true,
    });

    const filter = parseSearch<FilterParams>(
      search,
      SCENARIOS_SEARCH_SETTINGS,
    );

    const options: GetAutomationsOptions = {
      organisation_id: organisationId,
      max_results: totalAutomations,
      keywords: filter.keywords,
    };
    
    ScenarioService.getScenarios(organisationId, options)
      .then(apiResp => {
        const scenariosToUpdate = allRowsAreSelected ? apiResp.data : 
        (selectedRowKeys? apiResp.data.filter(scenario => selectedRowKeys.includes(scenario.id)) : []) 
        const tasks: Task[] = [];
        scenariosToUpdate.forEach(scenario => {
          tasks.push(() => {
            return this.updateAutomationStatus(scenario, status);
          });
        });
        executeTasksInSequence(tasks)
          .then(() => {
            this.setState(
              {
                isUpdatingStatuses: false,
              },
              () => {
                fetchAutomationList(organisationId, filter);
              },
            );
          })
          .catch((err: any) => {
            this.setState({
              isUpdatingStatuses: false,
            });
            this.props.notifyError(err);
          });
      } 
    );
  };

  render() {
    const {
      selectedRowKeys,
      isUpdatingStatuses,
      allRowsAreSelected,
    } = this.state;

    const {
      labels,
      translations,
      dataSource,
      hasAutomations,
      isFetchingAutomations,
      isFetchingAutomationsStat,
      totalAutomations,
      removeNotification,
      fetchAutomationList,
      resetAutomationsTable,
    } = this.props;

    const rowSelection = {
      selectedRowKeys,
      allRowsAreSelected: allRowsAreSelected,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const multiEditProps = {
      visible: this.state.visible,
      handleStatusAction: this.handleStatusAction,
    };

    const reduxProps = {
      labels,
      translations,
      dataSource,
      hasAutomations,
      isFetchingAutomations,
      isFetchingAutomationsStat,
      totalAutomations,
      removeNotification,
      fetchAutomationList,
      resetAutomationsTable,
    };

    return (
      <div className="ant-layout">
        <AutomationActionBar
          organisationId={this.props.match.params.organisationId}
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <AutomationListTable
              rowSelection={rowSelection}
              isUpdatingStatuses={isUpdatingStatuses}
              {...reduxProps}
            />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  hasAutomations: state.automationsTable.automationsApi.hasItems,
  isFetchingAutomationList: state.automationsTable.automationsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAutomations: state.automationsTable.automationsApi.total,
});

const mapDispatchToProps = {
  fetchAutomationList: AutomationsListActions.fetchAutomations.request,
  resetAutomationsTable: AutomationsListActions.resetAutomationsTable,
};

export default compose<AutomationListPageProps, JoinedProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectNotifications,
)(AutomationListPage);
