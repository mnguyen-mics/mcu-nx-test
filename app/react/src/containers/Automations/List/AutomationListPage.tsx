import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { compose } from 'recompose';
import { AutomationResource, AutomationStatus } from '../../../models/automations/automations';
import { Label } from '../../Labels/Labels';
import injectDrawer, { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { IScenarioService } from '../../../services/ScenarioService';
import AutomationListTable from './AutomationListTable';
import AutomationActionBar from './AutomationActionBar';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';

export interface MapDispatchToProps {
  labels: Label[];
}

const { Content } = Layout;

interface AutomationListPageState {
  selectedScenarios: AutomationResource[];
  visible: boolean;
  isUpdatingStatuses: boolean;
  isArchiving: boolean;
}

type JoinedProps = WrappedComponentProps &
  InjectedDrawerProps &
  MapDispatchToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationListPage extends React.Component<JoinedProps, AutomationListPageState> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedScenarios: [],
      visible: false,
      isUpdatingStatuses: false,
      isArchiving: false,
    };
  }

  updateAutomationStatus = (scenario: AutomationResource, status: AutomationStatus) => {
    const { notifyError } = this.props;

    return this._scenarioService
      .updateScenario(scenario.id, {
        id: scenario.id,
        name: scenario.name,
        status: status,
        datamart_id: scenario.datamart_id,
        organisation_id: scenario.organisation_id,
      })
      .catch(error => {
        notifyError(error);
      });
  };

  onSelectChange = (selectedRowKeys: string[], selectedRows: AutomationResource[]) => {
    this.setState({ selectedScenarios: selectedRows });
  };

  handleStatusAction = (status: AutomationStatus) => {
    const { notifyError } = this.props;
    const { selectedScenarios } = this.state;

    this.setState(
      {
        isUpdatingStatuses: true,
      },
      () => {
        const scenariosP = selectedScenarios.map(scenario => {
          return this.updateAutomationStatus(scenario, status);
        });
        Promise.all(scenariosP)
          .then(() => {
            this.setState({
              isUpdatingStatuses: false,
            });
          })
          .catch((err: any) => {
            notifyError(err);
            this.setState({
              isUpdatingStatuses: false,
            });
          });
      },
    );
  };

  render() {
    const { isUpdatingStatuses, selectedScenarios } = this.state;

    const { labels } = this.props;

    const rowSelection = {
      onChange: this.onSelectChange,
    };

    const multiEditProps = {
      visible: selectedScenarios.length !== 0,
      handleStatusAction: this.handleStatusAction,
    };

    const reduxProps = {
      labels,
    };

    return (
      <div className='ant-layout'>
        <AutomationActionBar
          organisationId={this.props.match.params.organisationId}
          multiEditProps={multiEditProps}
        />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
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
