import * as React from 'react';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import AutomationNodeModel from './AutomationNodeModel';
import { McsIcon } from '../../../../components';
import { ROOT_NODE_POSITION } from '../../../QueryTool/JSONOTQL/domain';

interface AutomationNodeProps {
  node: AutomationNodeModel;
  diagramEngine: DiagramEngine;
}

class AutomationNodeWidget extends React.Component<AutomationNodeProps> {
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
    const color = '#ffffff';
    const borderColor = node.getColor();

    return (
      <div
        className="node-body"
        style={{ width: `${node.width}px`, height: `${node.height}px` }}
      >
        <div
          className={'node-icon'}
          style={{
            width: node.getSize().width,
            height: node.getSize().height,
            borderWidth: node.getSize().borderWidth,
            borderColor: borderColor,
            float: 'left',
            color: color,
            backgroundColor: backgroundColor,
          }}
        >
          <McsIcon type={node.iconType} />
        </div>

        <div className="node-content">{node.title}</div>

        <div
          style={{
            position: 'absolute',
            top: node.height / 2,
            left: node.width / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: node.height / 2,
            left: node.width + 20,
          }}
        >
          <PortWidget name="right" node={this.props.node} />
        </div>
        {(node.y !== ROOT_NODE_POSITION.y ||
          node.x !== ROOT_NODE_POSITION.x) && (
          <div
            style={{
              position: 'absolute',
              top: node.height / 2 - 6,
              left: -10,
            }}
          >
            <McsIcon type="chevron-right" className="arrow" />
          </div>
        )}
      </div>
    );
  }
}

export default AutomationNodeWidget;
