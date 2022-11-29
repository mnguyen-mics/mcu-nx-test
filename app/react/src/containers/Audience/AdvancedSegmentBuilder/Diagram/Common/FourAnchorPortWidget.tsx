import * as React from 'react';
import { PortWidget } from 'storm-react-diagrams';
import { BooleanOperatorNodeModel } from '../BooleanOperatorNode';
import { FieldNodeModel } from '../FieldNode';
import { PlusNodeModel } from '../PlusNode';
import { ObjectNodeModel } from '../ObjectNode';
import AutomationNodeModel from '../../../../Automations/Builder/AutomationNode/AutomationNodeModel';

export interface FourAnchorPortWidgetProps {
  node:
    | BooleanOperatorNodeModel
    | FieldNodeModel
    | ObjectNodeModel
    | PlusNodeModel
    | AutomationNodeModel;
}

export default class FourAnchorPortWidget extends React.Component<FourAnchorPortWidgetProps, any> {
  public render() {
    const { node } = this.props;
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            top: (node.getSize().height + node.getSize().borderWidth / 2) / 2,
            left: 0,
          }}
        >
          <PortWidget name='left' node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: (node.getSize().width + node.getSize().borderWidth / 2) / 2,
          }}
        >
          <PortWidget name='top' node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: (node.getSize().height + node.getSize().borderWidth / 2) / 2,
            left: node.getSize().width - node.getSize().borderWidth / 2,
          }}
        >
          <PortWidget name='right' node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: node.getSize().height - node.getSize().borderWidth / 2,
            left: (node.getSize().width + node.getSize().borderWidth / 2) / 2,
          }}
        >
          <PortWidget name='bottom' node={this.props.node} />
        </div>
      </div>
    );
  }
}
