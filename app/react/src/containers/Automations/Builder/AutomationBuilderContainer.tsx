import * as React from 'react';
import { compose } from 'recompose';
import { Button, Layout } from 'antd';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
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

const messages = defineMessages({
  automationBuilder: {
    id: 'automation.builder.action.bar.path',
    defaultMessage: 'Automation Builder',
  },
});

export interface AutomationBuilderContainerProps {
  datamartId: string;
  renderActionBar: (datamartId: string) => React.ReactNode;
}

interface State {
  automationData: StorylineNodeModel;
}

type Props = AutomationBuilderContainerProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      automationData: this.buildAutomationTreeData(
        storylineResourceData,
        storylineNodeData,
        storylineEdgeData,
      ),
    };
  }

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

    return (
      <Layout>
        <ActionBar
          paths={[
            {
              name: intl.formatMessage(messages.automationBuilder),
            },
          ]}
        >
          <Button className="mcs-primary" type="primary">
            <FormattedMessage
              id="automation.builder.action.bar.save"
              defaultMessage="Save"
            />
          </Button>
        </ActionBar>
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
