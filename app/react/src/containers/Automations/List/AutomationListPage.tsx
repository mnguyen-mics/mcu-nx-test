import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout } from 'antd';
import { compose } from 'recompose';
import {
  AutomationResource,
  AutomationStatus,
} from '../../../models/automations/automations';
import { FilterParams } from '../../Campaigns/Display/List/DisplayCampaignsActionbar';
import { Label } from '../../Labels/Labels';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  GetAutomationsOptions,
  SCENARIOS_SEARCH_SETTINGS,
  IScenarioService,
} from '../../../services/ScenarioService';
import { parseSearch } from '../../../utils/LocationSearchHelper';
import { Task, executeTasksInSequence } from '../../../utils/PromiseHelper';
import AutomationListTable from './AutomationListTable';
import AutomationActionBar from './AutomationActionBar';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';

export interface MapDispatchToProps {
  labels: Label[];
}

const { Content } = Layout;

interface AutomationListPageState {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  visible: boolean;
  isUpdatingStatuses: boolean;
  isArchiving: boolean;
}

type JoinedProps = InjectedIntlProps &
  InjectedDrawerProps &
  MapDispatchToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationListPage extends React.Component<
  JoinedProps,
  AutomationListPageState
> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

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

  updateAutomationStatus = (
    scenario: AutomationResource,
    status: AutomationStatus,
  ) => {
    this.setState({
      isUpdatingStatuses: true,
    });
    const { notifyError } = this.props;

    return this._scenarioService
      .updateScenario(scenario.id, {
        id: scenario.id,
        name: scenario.name,
        status: status,
        datamart_id: scenario.datamart_id,
        organisation_id: scenario.organisation_id,
      })
      .then(() => {
        this.setState({
          isUpdatingStatuses: false,
          selectedRowKeys: [],
        });
        return null;
      })
      .catch(error => {
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
      match: {
        params: { organisationId },
      },
      location: { search },
    } = this.props;
    const { allRowsAreSelected, selectedRowKeys } = this.state;
    this.setState({
      isUpdatingStatuses: true,
    });

    const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);

    const options: GetAutomationsOptions = {
      organisation_id: organisationId,
      keywords: filter.keywords,
    };

    this._scenarioService
      .getScenarios(organisationId, options)
      .then(apiResp => {
        const scenariosToUpdate = allRowsAreSelected
          ? apiResp.data
          : selectedRowKeys
          ? apiResp.data.filter(scenario =>
              selectedRowKeys.includes(scenario.id),
            )
          : [];
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
                this._scenarioService.getScenarios(organisationId, filter);
              },
            );
          })
          .catch((err: any) => {
            this.setState({
              isUpdatingStatuses: false,
            });
            this.props.notifyError(err);
          });
      });
  };

  render() {
    const {
      selectedRowKeys,
      isUpdatingStatuses,
      allRowsAreSelected,
    } = this.state;

    const { labels } = this.props;

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

export default compose<{}, JoinedProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
)(AutomationListPage);
