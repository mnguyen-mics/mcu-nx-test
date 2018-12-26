import * as React from 'react';
import { compose } from 'recompose';
import { message, Layout, Button } from 'antd';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { RouteComponentProps, withRouter } from 'react-router';
import AutomationBuilder from './AutomationBuilder';
import {
  StorylineResource,
  ScenarioEdgeResource,
  ScenarioNodeShape,
} from '../../../models/automations/automations';
import {
  StorylineNodeModel,
  AutomationNodeShape,
  storylineResourceData,
  storylineEdgeData,
  storylineNodeData,
} from './domain';
import ActionBar from '../../../components/ActionBar';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { messages } from './AutomationBuilderPage';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IScenarioService } from '../../../services/ScenarioService';
import { isScenarioNodeShape } from './AutomationNode/Edit/domain';

export interface AutomationBuilderContainerProps {
  datamartId: string;
}

interface State {
  automationData: StorylineNodeModel;
  loading: boolean;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);

    this.state = {
      automationData: this.buildAutomationTreeData(
        storylineResourceData,
        storylineNodeData,
        storylineEdgeData,
      ),
      loading: false,
    };
  }

  saveAutomation = () => {
    const { intl, notifyError } = this.props;

    const { automationData } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    this.setState({
      loading: true,
    });

    if (isScenarioNodeShape(automationData.node)) {
      this._scenarioService
        .createScenarioNode(automationData.node)
        .then(() => {
          hideSaveInProgress();
          this.close();
          message.success(intl.formatMessage(messages.automationSaved));
        })
        .catch(err => {
          this.setState({ loading: false });
          notifyError(err);
          hideSaveInProgress();
        });
    }
  };

  close = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/automations/list`;

    return history.push(url);
  };

  buildAutomationTreeData(
    storylineData: StorylineResource,
    nodeData: ScenarioNodeShape[],
    edgeData: ScenarioEdgeResource[],
  ): StorylineNodeModel {
    const node: AutomationNodeShape = nodeData.filter(
      n => n.id === storylineData.begin_node_id,
    )[0];
    const outNodesId: string[] = edgeData
      .filter(e => e.source_id === node.id)
      .map(e => e.target_id);
    const outNodes: ScenarioNodeShape[] = nodeData.filter(n =>
      outNodesId.includes(n.id),
    );

    return {
      node: node,
      out_edges: outNodes.map(n =>
        this.buildStorylineNodeModel(n, nodeData, edgeData, node),
      ),
    };
  }

  buildStorylineNodeModel(
    node: ScenarioNodeShape,
    nodeData: ScenarioNodeShape[],
    edgeData: ScenarioEdgeResource[],
    parentNode: AutomationNodeShape,
  ): StorylineNodeModel {
    const outNodesId: string[] = edgeData
      .filter(e => e.source_id === node.id)
      .map(e => e.target_id);
    const outNodes: ScenarioNodeShape[] = nodeData.filter(n =>
      outNodesId.includes(n.id),
    );
    const inEdge: ScenarioEdgeResource = edgeData.filter(
      e => e.source_id === parentNode.id && e.target_id === node.id,
    )[0];

    return {
      node: node,
      in_edge: inEdge,
      out_edges: outNodes.map(n =>
        this.buildStorylineNodeModel(n, nodeData, edgeData, node),
      ),
    };
  }

  handleUpdateAutomationData = (
    newAutomationData: StorylineNodeModel,
  ): StorylineNodeModel => {
    this.setState(prevState => {
      return {
        automationData: newAutomationData,
      };
    });
    return newAutomationData;
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const renderActionBar = () => {
      return (
        <ActionBar
          paths={[
            {
              name: intl.formatMessage(messages.automationBuilder),
            },
          ]}
        >
          <Button
            className="mcs-primary"
            type="primary"
            onClick={this.saveAutomation}
          >
            <FormattedMessage
              id="automation.builder.action.bar.save"
              defaultMessage="Save As"
            />
          </Button>
        </ActionBar>
      );
    };

    return (
      <Layout>
        {renderActionBar()}
        <Layout.Content
          className={`mcs-content-container`}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <AutomationBuilder
            datamartId={this.props.datamartId}
            organisationId={organisationId}
            automationData={this.state.automationData}
            scenarioId={storylineNodeData[0].scenario_id}
            updateAutomationData={this.handleUpdateAutomationData}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
