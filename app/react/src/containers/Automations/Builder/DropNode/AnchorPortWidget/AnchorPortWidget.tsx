import * as React from 'react';
import { PortWidget } from 'storm-react-diagrams';
import DropNodeModel from '../DropNodeModel';

export interface AnchorPortWidgetProps {
  node: DropNodeModel;
}

export default class AnchorPortWidget extends React.Component<AnchorPortWidgetProps, any> {
  public render() {
    return (
      <div>
        <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <PortWidget name="left" node={this.props.node} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <PortWidget name="right" node={this.props.node} />
          </div>
      </div>
    );
  }
}
