import * as React from 'react';
import cuid from 'cuid';
import { McsIconType } from '../../../../components/McsIcon';
import { Row, Tree } from 'antd';
import AvailableNode from './AvailableNode';

const { TreeNode } = Tree;

interface FakeNode {
  id: number;
  name: string;
  icon: McsIconType;
  color: string;
}

interface State {
  actionNodes: FakeNode[];
  conditionNodes: FakeNode[];
  exitsNodes: FakeNode[];
}

const fakeNode: FakeNode = {
  id: 1,
  name: 'Send email',
  icon: 'email',
  color: '#0ba6e1',
};

const fakeNode2: FakeNode = {
  id: 2,
  name: 'Send Text',
  icon: 'menu-close',
  color: '#0ba6e1',
};

const fakeNode3: FakeNode = {
  id: 3,
  name: 'Send Push',
  icon: 'tablet',
  color: '#0ba6e1',
};

const fakeNode4: FakeNode = {
  id: 4,
  name: 'HTTP Api',
  icon: 'settings',
  color: '#0ba6e1',
};

const conditionNode1: FakeNode = {
  id: 5,
  name: 'Split',
  icon: 'close',
  color: '#fbc02d',
};

const conditionNode2: FakeNode = {
  id: 6,
  name: 'Wait',
  icon: 'menu-close',
  color: '#fbc02d',
};

const exitNode1: FakeNode = {
  id: 7,
  name: 'Failure',
  icon: 'close',
  color: '#ff5959',
};

const exitNode2: FakeNode = {
  id: 8,
  name: 'Goal',
  icon: 'check',
  color: '#18b577',
};

class AvailableNodeVisualizer extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      actionNodes: [],
      conditionNodes: [],
      exitsNodes: [],
    };
  }

  componentWillMount() {
    this.setState({
      actionNodes: [fakeNode, fakeNode2, fakeNode3, fakeNode4],
      conditionNodes: [conditionNode1, conditionNode2],
      exitsNodes: [exitNode1, exitNode2],
    });
  }

  createNodeGrid = (nodeType: string, nodes: FakeNode[]) => {
    return (
      <Tree defaultExpandAll={true} multiple={false} draggable={false}>
        <TreeNode title={nodeType} selectable={false}>
          {nodes.map(node => {
            return (
              <TreeNode
                title={
                  <AvailableNode
                    key={node.id}
                    title={node.name}
                    icon={node.icon}
                    color={node.color}
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
    return (
      <div>
        <Row className="available-node-visualizer-row">
          {this.createNodeGrid('Actions', this.state.actionNodes)}
        </Row>
        <Row className="available-node-visualizer-row">
          {this.createNodeGrid('Conditions', this.state.conditionNodes)}
        </Row>
        <Row className="available-node-visualizer-row">
          {this.createNodeGrid('Exits', this.state.exitsNodes)}
        </Row>
      </div>
    );
  }
}

export default AvailableNodeVisualizer;
