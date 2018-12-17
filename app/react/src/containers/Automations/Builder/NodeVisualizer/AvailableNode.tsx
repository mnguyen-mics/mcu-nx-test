import McsIcon, { McsIconType } from '../../../../components/McsIcon';
import cuid from 'cuid';
import React from 'react';
import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
} from 'react-dnd';
import { AntIcon } from '../domain';
import { Icon } from 'antd';

interface AvailableNodeProps {
  id: string;
  name: string;
  type: string;
  color: string;
  connectDragSource?: ConnectDragSource;
  isDragging?: boolean;
  isDropped?: boolean;
  icon?: McsIconType;
  iconAnt?: AntIcon;
}

const fieldSource = {
  beginDrag(props: AvailableNodeProps) {
    return {
      id: cuid(),
      name: props.name,
      icon: props.icon,
      iconAnt: props.iconAnt,
      color: props.color,
      type: props.type,
    };
  },
};

class AvailableNode extends React.Component<AvailableNodeProps> {
  render() {
    const { name, icon, color, connectDragSource, iconAnt } = this.props;

    return (
      connectDragSource &&
      connectDragSource(
        <div className="available-node">
          <div
            className="available-node-icon"
            style={{ backgroundColor: color }}
          >
          { iconAnt ? <Icon type={iconAnt} className="available-node-icon-gyph"/> : 
          <McsIcon type={icon as McsIconType} className="available-node-icon-gyph" />
        }
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
