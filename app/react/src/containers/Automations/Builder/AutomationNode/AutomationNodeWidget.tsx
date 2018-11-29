import * as React from 'react';
import { DiagramEngine } from 'storm-react-diagrams';
import AutomationNodeModel from './AutomationNodeModel';
import { McsIcon } from '../../../../components';
import FourAnchorPortWidget from '../../../QueryTool/JSONOTQL/Diagram/Common/FourAnchorPortWidget';

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
      <div className="node-body">
        <div ref={ref => this.setPosition(ref)}>
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

          <FourAnchorPortWidget node={node} />
        </div>
        <div className="node-content">{node.title}</div>
      </div>
    );
  }
}

export default AutomationNodeWidget;
