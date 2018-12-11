import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';

interface AvailableNodeProps {
  title: string;
  icon: McsIconType;
  color: string;
  connectDragSource?: ConnectDragSource;
  isDragging?: boolean;
  isDropped?: boolean;
}

const fieldSource = {
  beginDrag(props: AvailableNodeProps) {
    return {
      title: props.title,
      icon: props.icon,
      color: props.color,
    };
  },
};

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    const { title, icon, color, connectDragSource } = this.props;

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
          <div className="available-node-text">{title}</div>
          </div>,
    ));
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
