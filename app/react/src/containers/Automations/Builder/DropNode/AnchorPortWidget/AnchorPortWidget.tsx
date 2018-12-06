import * as React from 'react';
import { PortWidget } from 'storm-react-diagrams';
import DropNodeModel from '../DropNodeModel';

export interface AnchorPortWidgetProps {
  node: DropNodeModel;
}

export default class AnchorPortWidget extends React.Component<AnchorPortWidgetProps, any> {
  public render() {
    const { node } = this.props;
    return (
      <div>
        <div
            style={{
              position: 'absolute',
              top: node.getSize().width*2 + node.getSize().borderWidth*4,
              left: node.getSize().width/2,
            }}
          >
            <PortWidget name="center" node={node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: node.getSize().width + node.getSize().borderWidth,
              left: node.getSize().width/2,
            }}
          >
            <PortWidget name="right" node={node} />
          </div>
      </div>
    );
  }
}
