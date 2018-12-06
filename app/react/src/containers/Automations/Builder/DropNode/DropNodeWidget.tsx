import * as React from 'react';
import { DiagramEngine } from 'storm-react-diagrams';
import DropNodeModel from './DropNodeModel';
import AnchorPortWidget from './AnchorPortWidget/AnchorPortWidget';

interface DropNodeProps {
  node: DropNodeModel;
  diagramEngine: DiagramEngine;
}

class DropNodeWidget extends React.Component<DropNodeProps> {
  top: number = 0;
  left: number = 0;

  setPosition = (node: HTMLDivElement | null) => {
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top : 0;
    this.left = viewportOffset ? viewportOffset.left : 0;
  };

  render() {
    const { node } = this.props;

    const backgroundColor = node.getColor();
    const borderColor = node.getColor();

    return (
        <div ref={ref => this.setPosition(ref)}>
          <div
            className={'drop-node'}
            style={{
              width: node.getSize().width,
              height: node.getSize().height,
              borderWidth: node.getSize().borderWidth,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
            }}
          />
          <AnchorPortWidget node={node} />
        </div>
    );
  }
}

export default DropNodeWidget;
