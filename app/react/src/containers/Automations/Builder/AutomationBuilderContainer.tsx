import * as React from 'react';
import { compose } from 'recompose';
import { /*message,*/ Layout } from 'antd';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
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
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AutomationActionBar from './ActionBar/AutomationActionBar';

export interface AutomationBuilderContainerProps {
  datamartId: string;
}

interface State {
  automationData: StorylineNodeModel;
  loading: boolean;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps;

class AutomationBuilderContainer extends React.Component<Props, State> {
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
    const { datamartId } = this.props;

    const { automationData } = this.state;

    return (
      <Layout>
        <AutomationActionBar
          datamartId={datamartId}
          automationTreeData={automationData}
        />
        <Layout.Content
          className={`mcs-content-container`}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <AutomationBuilder
            datamartId={datamartId}
            automationData={automationData}
            scenarioId={storylineNodeData[0].scenario_id}
            updateAutomationData={this.handleUpdateAutomationData}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
