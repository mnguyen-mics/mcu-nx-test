import * as React from 'react';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import FieldNodeModel from './FieldNodeModel';
import FieldNodeComparisonRenderer from './FieldNodeComparisonRenderer';
import { McsIcon, ButtonStyleless } from '../../../../../components';
import { TreeNodeOperations } from '../../domain';

interface Props {
  node: FieldNodeModel;
  diagramEngine: DiagramEngine;
  treeNodeOperations: TreeNodeOperations;
}

export default class FieldNodeWidget extends React.Component<Props> {
  removeNode = () =>
    this.props.treeNodeOperations.deleteNode(this.props.node.treeNodePath);

  render() {
    const { node } = this.props;

    return (
      <div
        className="field-node"
        style={{
          ...node.getSize(),
          backgroundColor: '#ffffff',
          borderStyle: 'solid',
          color: node.getColor(),
          borderColor: node.getColor(),
        }}
      >
        <div className="field">
          <div className="buttons">
            <ButtonStyleless onClick={this.removeNode}>
              <McsIcon type="close" />
            </ButtonStyleless>
          </div>
          <FieldNodeComparisonRenderer node={node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: (node.getSize().height - node.getSize().borderWidth / 2) / 2,
            left: (node.getSize().width - node.getSize().borderWidth / 2) / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>
      </div>
    );
  }
}
