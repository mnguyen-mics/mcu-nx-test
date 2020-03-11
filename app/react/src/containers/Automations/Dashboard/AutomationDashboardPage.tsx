import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../Edit/domain';

import { IAutomationFormService } from '../Edit/AutomationFormService';
import { Loading, McsIcon } from '../../../components';
import { Layout, Button } from 'antd';
import AutomationBuilder from '../Builder/AutomationBuilder';
import ActionBar, { Path } from '../../../components/ActionBar';
import { IScenarioService } from '../../../services/ScenarioService';
import { AutomationStatus } from '../../../models/automations/automations';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';

export interface AutomationDashboardrams {
  organisationId: string;
  automationId: string;
}

interface State {
  isLoading: boolean;
  updating: boolean;
  automationFormData: Partial<AutomationFormData>;
}

type Props = RouteComponentProps<AutomationDashboardrams> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedFeaturesProps;


class AutomationDashboardPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      updating: false,
      automationFormData: INITIAL_AUTOMATION_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    if (automationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    const {
      match: {
        params: { automationId: prevAutomationId },
      },
    } = prevProps;
    if (!automationId && automationId !== prevAutomationId) {
      this.setState({
        automationFormData: INITIAL_AUTOMATION_DATA,
      });
    } else if (automationId !== prevAutomationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  renderStatus = (status: AutomationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span><McsIcon type="pause" /> Pause</span>
      case 'NEW':
      case 'PAUSED':
        return <span><McsIcon type="play" /> Activate</span>
    }
  }

  onStatusClick = (automationId: string, status: AutomationStatus) => () => {
    const newStatus: AutomationStatus = status === 'PAUSED' || status === 'NEW' ? 'ACTIVE' : 'PAUSED';
    const payload = {
      status: newStatus,
      id: automationId
    }

    this.setState({ updating: true })
    return this._scenarioService.updateScenario(automationId, payload)
      .then(r => this.setState({
        automationFormData: { 
          ...this.state.automationFormData, 
          automation: r.data 
        }, 
        updating: false  
      }));

  }

  onEditClick = () => {
    const {
      history,
      match: {
        params: {
          organisationId,
          automationId
        }
      }
    } = this.props;
    history.push(`/v2/o/${organisationId}/automations/${automationId}/edit`);
  }

  render() {
    const { match: { params: { organisationId } }, hasFeature, intl } = this.props;
    const { automationFormData, isLoading, updating, } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    if (!automationFormData.automation || !automationFormData.automationTreeData) {
      return ('this automation does not seem to exist!')
    }

    const breadCrumbPaths: Path[] = [
      {
        name: 'Automations',
        path: `/v2/o/${organisationId}/automations`
      },
      {
        name: automationFormData.automation.name ? automationFormData.automation.name : ''
      }
    ];


    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout>
          <ActionBar
            paths={breadCrumbPaths}
          >
            {automationFormData.automation && automationFormData.automation.status && automationFormData.automation.id ? <Button onClick={this.onStatusClick(automationFormData.automation.id, automationFormData.automation.status)} className={"mcs-primary"} type="primary">
              {updating ? <i className="mcs-table-cell-loading" style={{ minWidth: 50}} /> : this.renderStatus(automationFormData.automation.status)}
            </Button> : null}
            <Button onClick={this.onEditClick}>
              <McsIcon type={"pen"} /> Edit
            </Button>
          </ActionBar>
          
          <Layout.Content
            className={`mcs-content-container`}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <AutomationBuilder
              datamartId={automationFormData.automation.datamart_id!}
              automationTreeData={automationFormData.automationTreeData}
              scenarioId={automationFormData.automation.id!}
              viewer={true}
              creation_mode={automationFormData.automationTreeData && automationFormData.automationTreeData.node.type === 'QUERY_INPUT' ? automationFormData.automationTreeData.node.ui_creation_mode : 'QUERY'}
              hasFeature={hasFeature}
              intl={intl}
            />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures
)(AutomationDashboardPage);
