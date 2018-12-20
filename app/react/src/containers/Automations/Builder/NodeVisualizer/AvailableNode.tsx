import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import cuid from 'cuid';
import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { Icon } from 'antd';
import { ScenarioNodeShape } from '../../../../models/automations/automations';
import { generateNodeProperties } from '../domain';
import { isAbnNode } from '../AutomationNode/Edit/domain';

interface AvailableNodeProps {
  node: ScenarioNodeShape;
  connectDragSource?: ConnectDragSource;
  isDragging?: boolean;
  isDropped?: boolean;
}

const fieldSource = {
  beginDrag(props: AvailableNodeProps) {
    return {
      id: cuid(),
      name: props.node.name,
      icon: generateNodeProperties(props.node).iconType,
      iconAnt: generateNodeProperties(props.node).iconAnt,
      color: generateNodeProperties(props.node).color,
      type: props.node.type,
      branch_number: isAbnNode(props.node) ? props.node.branch_number : 0,
    };
  },
};

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    const { node, connectDragSource } = this.props;
    const name = node.name;
    const icon = generateNodeProperties(node).iconType;
    const color = generateNodeProperties(node).color;
    const iconAnt = generateNodeProperties(node).iconAnt;

    return (
      connectDragSource &&
      connectDragSource(
        <div className="available-node">
          <div
            className="available-node-icon"
            style={{ backgroundColor: color }}
          >
            {iconAnt ? (
              <Icon type={iconAnt} className="available-node-icon-gyph" />
            ) : (
              <McsIcon
                type={icon as McsIconType}
                className="available-node-icon-gyph"
              />
            )}
          </div>
          <div className="available-node-text">{name}</div>
        </div>,
      )
    );
  }
}

export default DragSource(
  () => 'automation-node',
  fieldSource,
  (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(AvailableNode);
