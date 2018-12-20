import * as React from 'react';
import cuid from 'cuid';
import { McsIconType } from '../../../../components/McsIcon';
import { Row, Tree } from 'antd';
import AvailableNode from './AvailableNode';
import { ScenarioNodeShape } from '../../../../models/automations/automations';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { AntIcon } from '../domain';

const { TreeNode } = Tree;

const messages = defineMessages({
  availableNodeTitle: {
    id: 'automation.builder.availableNode.title',
    defaultMessage: 'Automation Components',
  },
  availableNodeSubtitle: {
    id: 'automation.builder.availableNode.subtitle',
    defaultMessage:
      'Drag and drop your components in the builder to create your automation.',
  },
});

export interface FakeNode {
  node: ScenarioNodeShape;
  iconType?: McsIconType;
  iconAnt?: AntIcon;
  color: string;
  branchNumber?: number;
}

interface State {
  actionNodes: ScenarioNodeShape[];
  conditionNodes: ScenarioNodeShape[];
  exitsNodes: ScenarioNodeShape[];
}

const fakeNode: ScenarioNodeShape = {
  id: cuid(),
  name: 'Send Email',
  type: 'EMAIL_CAMPAIGN',
  scenario_id: '1',
  campaign_id: '',
};

const fakeNode2: ScenarioNodeShape = {
  id: cuid(),
  name: 'Display Advertising',
  type: 'DISPLAY_CAMPAIGN',
  campaign_id: '',
  scenario_id: '1',
  ad_group_id: '',
};

const conditionNode1: ScenarioNodeShape = {
  id: cuid(),
  name: 'Split',
  type: 'ABN_NODE',
  scenario_id: '1',
  edges_selection: {},
};

const conditionNode2: ScenarioNodeShape = {
  id: cuid(),
  name: 'Wait',
  type: 'WAIT',
  scenario_id: '1',
};

type Props = InjectedIntlProps;

class AvailableNodeVisualizer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      actionNodes: [],
      conditionNodes: [],
      exitsNodes: [],
    };
  }

  generateNodeProperties = (node: ScenarioNodeShape): FakeNode => {
    switch (node.type) {
      case 'DISPLAY_CAMPAIGN':
        return {
          node: node,
          iconType: 'display',
          color: '#0ba6e1',
        };
      case 'EMAIL_CAMPAIGN':
        return {
          node: node,
          iconType: 'email',
          color: '#0ba6e1',
        };
      case 'QUERY_INPUT':
      return {
        node: node,
        iconType: 'question',
        color: '#fbc02d',
      };
      case 'ABN_NODE':
        return {
          node: node,
          iconAnt: 'fork',
          color: '#fbc02d',
        };
      case 'GOAL':
        return {
          node: node,
          iconType: 'check',
          color: '#18b577',
        };
      case 'FAILURE':
        return {
          node: node,
          iconType: 'close',
          color: '#ff5959',
        };
        case 'WAIT':
        return {
          node: node,
          iconAnt: 'clock-circle',
          color: '#fbc02d',
        };
      default:
        return {
          node: node,
          iconType: 'info',
          color: '#fbc02d',
        };
    }
  };

  componentWillMount() {
    this.setState({
      actionNodes: [fakeNode, fakeNode2],
      conditionNodes: [conditionNode1, conditionNode2],
      exitsNodes: [],
    });
  }

  createNodeGrid = (nodeType: string, nodes: ScenarioNodeShape[]) => {
    return (
      <Tree defaultExpandAll={true} multiple={false} draggable={false}>
        <TreeNode title={nodeType} selectable={false}>
          {nodes.map(node => {
            return (
              <TreeNode
                title={
                  <AvailableNode
                    key={node.id}
                    id={node.id}
                    type={node.type}
                    name={node.name}
                    branchNumber={
                      this.generateNodeProperties(node).branchNumber
                    }
                    icon={this.generateNodeProperties(node).iconType}
                    iconAnt={this.generateNodeProperties(node).iconAnt}
                    color={this.generateNodeProperties(node).color}
                  />
                }
                key={cuid()}
              />
            );
          })}
        </TreeNode>
      </Tree>
    );
  };

  render() {
    const { intl } = this.props;
    return (
      <div>
        <Row className="available-node-visualizer-header">
          <div className="available-node-visualizer-title">
            {intl.formatMessage(messages.availableNodeTitle)}
          </div>
          <div className="available-node-visualizer-subtitle">
            {intl.formatMessage(messages.availableNodeSubtitle)}
          </div>
        </Row>
        <Row className="available-node-visualizer-row">
          {this.createNodeGrid('Actions', this.state.actionNodes)}
        </Row>
        <Row className="available-node-visualizer-row">
          {this.createNodeGrid('Conditions', this.state.conditionNodes)}
        </Row>
      </div>
    );
  }
}

export default injectIntl(AvailableNodeVisualizer);
