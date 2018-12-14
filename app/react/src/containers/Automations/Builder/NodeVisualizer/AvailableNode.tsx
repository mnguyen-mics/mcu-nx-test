import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';

interface AvailableNodeProps {
  id: string;
  name: string;
  type: string;
  icon: McsIconType;
  color: string;
  connectDragSource?: ConnectDragSource;
  isDragging?: boolean;
  isDropped?: boolean;
}

const fieldSource = {
  beginDrag(props: AvailableNodeProps) {
    return {
      id: props.id,
      name: props.name,
      icon: props.icon,
      color: props.color,
      type: props.type,
    };
  },
};

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    const { name, icon, color, connectDragSource } = this.props;

    return (
      connectDragSource &&
      connectDragSource(
        <div className="available-node">
          <div
            className="available-node-icon"
            style={{ backgroundColor: color }}
          >
            <McsIcon type={icon} className="available-node-icon-gyph" />
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
